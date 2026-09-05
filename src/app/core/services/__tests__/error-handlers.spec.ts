import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_ERROR_CONSTANTS } from '../../constants/error.constant';
import { ALERT_DURATION } from '../../models/alert.model';
import { AlertService } from '../alert.service';
import { AuthErrorHandlerService } from '../auth-error-handler.service';
import { AlertError, BaseErrorAction, BaseErrorHandler } from '../error-handlers';

class MockAction extends BaseErrorAction<{ custom?: string; }> {
  override execute = vi.fn();
}

class TestErrorHandler extends BaseErrorHandler<{ custom?: string; }> { }

const mockAlertService = {
  show: vi.fn(),
} as unknown as AlertService;

describe('Error Handlers', () => {
  describe('BaseErrorAction', () => {
    it('should set configuration properly and support fluent chaining', () => {
      const action = new MockAction();
      const returnedAction = action
        .setErrorActionConfig({
          errorStatus: [HttpStatusCode.NotFound],
          priority: 200,
          description: 'Test Not Found',
          context: { custom: 'configured' },
          predicate: (err) => err.status === 404,
        })
        .setContext({ custom: 'overridden' });

      expect(returnedAction).toBe(action);
      expect(action.errorStatus).toEqual([HttpStatusCode.NotFound]);
      expect(action.priority).toBe(200);
      expect(action.description).toBe('Test Not Found');
      expect(action.context).toEqual({ custom: 'overridden' });
      expect(action.predicate).toBeDefined();
    });
  });

  describe('BaseErrorHandler', () => {
    let errorHandler: TestErrorHandler;

    beforeEach(() => {
      errorHandler = new TestErrorHandler();
    });

    it('should initialize with empty custom handlers and null default handler', () => {
      expect(errorHandler.customErrorHandlers()).toEqual([]);
      expect(errorHandler.defaultErrorHandler()).toBeNull();
    });

    it('should execute matching custom handler by status code', () => {
      const handler400 = new MockAction();
      handler400.setErrorActionConfig({ errorStatus: [HttpStatusCode.BadRequest] });
      errorHandler.addCustomHandler(handler400);

      const error = new HttpErrorResponse({ status: HttpStatusCode.BadRequest });
      const callback = vi.fn();

      errorHandler.handle(error, { custom: 'runtime-info' }, callback);

      expect(handler400.execute).toHaveBeenCalledWith(error, { custom: 'runtime-info' });
      expect(callback).toHaveBeenCalledWith(error);
    });

    it('should match custom handler using predicate', () => {
      const handlerConflict = new MockAction();
      handlerConflict.setErrorActionConfig({
        errorStatus: [HttpStatusCode.Conflict],
        predicate: (err) => err.error?.message === 'Duplicate entry',
      });
      errorHandler.addCustomHandler(handlerConflict);

      const matchingError = new HttpErrorResponse({
        status: HttpStatusCode.Conflict,
        error: { message: 'Duplicate entry' },
      });

      const nonMatchingError = new HttpErrorResponse({
        status: HttpStatusCode.Conflict,
        error: { message: 'Other conflict' },
      });

      errorHandler.handle(matchingError);
      expect(handlerConflict.execute).toHaveBeenCalledWith(matchingError, undefined);

      handlerConflict.execute.mockClear();
      errorHandler.handle(nonMatchingError);
      expect(handlerConflict.execute).not.toHaveBeenCalled();
    });

    it('should filter custom handlers by endpoint URL', () => {
      const registerHandler = new MockAction();
      registerHandler.setErrorActionConfig({
        errorStatus: [HttpStatusCode.Conflict],
        urls: ['/auth/register'],
      });
      errorHandler.addCustomHandler(registerHandler);

      const registerError = new HttpErrorResponse({
        status: HttpStatusCode.Conflict,
        url: 'http://localhost:3000/api/auth/register',
      });

      const profileError = new HttpErrorResponse({
        status: HttpStatusCode.Conflict,
        url: 'http://localhost:3000/api/auth/profile',
      });

      errorHandler.handle(registerError);
      expect(registerHandler.execute).toHaveBeenCalledWith(registerError, undefined);

      registerHandler.execute.mockClear();
      errorHandler.handle(profileError);
      expect(registerHandler.execute).not.toHaveBeenCalled();
    });

    it('should prioritize higher priority handler when both match', () => {
      const lowPriority = new MockAction();
      lowPriority.setErrorActionConfig({
        errorStatus: [HttpStatusCode.BadRequest],
        priority: 10,
      });

      const highPriority = new MockAction();
      highPriority.setErrorActionConfig({
        errorStatus: [HttpStatusCode.BadRequest],
        priority: 50,
      });

      errorHandler.addCustomHandler(lowPriority);
      errorHandler.addCustomHandler(highPriority);

      const error = new HttpErrorResponse({ status: HttpStatusCode.BadRequest });
      errorHandler.handle(error);

      expect(highPriority.execute).toHaveBeenCalled();
      expect(lowPriority.execute).not.toHaveBeenCalled();
    });

    it('should fallback to default error handler if no custom handler matches', () => {
      const defaultHandler = new MockAction();
      errorHandler.setDefaultHandler(defaultHandler);

      const error = new HttpErrorResponse({ status: HttpStatusCode.InternalServerError });
      errorHandler.handle(error);

      expect(defaultHandler.execute).toHaveBeenCalledWith(error, undefined);
    });
  });

  describe('AlertError', () => {
    let mockAlertService: AlertService;

    beforeEach(() => {
      mockAlertService = {
        show: vi.fn(),
        error: vi.fn(),
      } as unknown as AlertService;
    });

    it('should trigger AlertService show with backend error payload message and default settings', () => {
      const alertError = new AlertError(mockAlertService);
      const error = new HttpErrorResponse({
        status: HttpStatusCode.Unauthorized,
        error: { message: 'Credenziali non valide' },
      });

      alertError.execute(error);

      expect(mockAlertService.show).toHaveBeenCalledWith({
        type: 'error',
        message: 'Credenziali non valide',
        closeTime: ALERT_DURATION.DEFAULT,
        icon: null,
      });
    });

    it('should respect action-configured context with custom closeTime and message', () => {
      const alertError = new AlertError(mockAlertService).setErrorActionConfig({
        context: {
          message: 'Errore personalizzato',
          closeTime: ALERT_DURATION.SHORT,
          type: 'warning',
        },
      });

      const error = new HttpErrorResponse({ status: HttpStatusCode.BadRequest });
      alertError.execute(error);

      expect(mockAlertService.show).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Errore personalizzato',
        closeTime: ALERT_DURATION.SHORT,
        icon: null,
      });
    });

    it('should allow runtime context overrides at execution callsite', () => {
      const alertError = new AlertError(mockAlertService, {
        message: 'Default msg',
        closeTime: ALERT_DURATION.DEFAULT,
      });

      const error = new HttpErrorResponse({ status: HttpStatusCode.BadRequest });
      alertError.execute(error, {
        message: 'Runtime override msg',
        closeTime: ALERT_DURATION.LONG,
        title: 'Attenzione',
      });

      expect(mockAlertService.show).toHaveBeenCalledWith({
        type: 'error',
        message: 'Runtime override msg',
        closeTime: ALERT_DURATION.LONG,
        icon: null,
        title: 'Attenzione',
      });
    });
  });

  describe('AuthErrorHandlerService', () => {
    let authErrorHandler: AuthErrorHandlerService;

    beforeEach(() => {
      vi.clearAllMocks();
      TestBed.configureTestingModule({
        providers: [
          AuthErrorHandlerService,
          { provide: AlertService, useValue: mockAlertService },
        ],
      });
      authErrorHandler = TestBed.inject(AuthErrorHandlerService);
    });

    it('should correctly handle user already registered conflict (409)', () => {
      const error409 = new HttpErrorResponse({
        status: HttpStatusCode.Conflict,
        url: '/auth/register',
        error: { message: AUTH_ERROR_CONSTANTS.UserExists },
      });

      authErrorHandler.handle(error409);

      expect(mockAlertService.show).toHaveBeenCalledWith({
        type: 'error',
        message: "L' utente risulta già registrato!",
        closeTime: ALERT_DURATION.DEFAULT,
        icon: null,
      });
    });

    it('should correctly handle wrong credentials unauthorized (401)', () => {
      const error401 = new HttpErrorResponse({
        status: HttpStatusCode.Unauthorized,
        url: '/auth/login',
        error: { message: 'Invalid credentials' },
      });

      authErrorHandler.handle(error401);

      expect(mockAlertService.show).toHaveBeenCalledWith({
        type: 'error',
        message: 'Le credenziali inserite non sono valide!',
        closeTime: ALERT_DURATION.SHORT,
        icon: null,
      });
    });

    it('should fallback to default error alert on unhandled error', () => {
      const genericError = new HttpErrorResponse({
        status: HttpStatusCode.InternalServerError,
        error: { message: 'Internal Server Error' },
      });

      authErrorHandler.handle(genericError);

      expect(mockAlertService.show).toHaveBeenCalledWith({
        type: 'error',
        message: 'Internal Server Error',
        closeTime: ALERT_DURATION.DEFAULT,
        icon: null,
      });
    });
  });
});
