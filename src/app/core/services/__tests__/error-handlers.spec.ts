import '@angular/compiler';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_ERROR_CONSTANTS } from '../../constants/error.constant';
import { ALERT_DURATION } from '../../models/alert.model';
import { AlertService } from '../alert.service';
import { AuthErrorHandlerService } from '../auth-error-handler.service';
import { AlertError, BaseErrorAction, BaseErrorHandler } from '../error-handlers';

class MockAction extends BaseErrorAction<{ custom?: string }> {
  override execute = vi.fn();
}

class TestErrorHandler extends BaseErrorHandler<{ custom?: string }> {}

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
    it('should correctly handle user already registered conflict (409)', () => {
      const mockAlertService = {
        show: vi.fn(),
      } as unknown as AlertService;

      const authErrorHandler = new AuthErrorHandlerService();
      // Inject mock alert service into private handler instances
      (authErrorHandler as unknown as { defaultAlert: AlertError }).defaultAlert = new AlertError(
        mockAlertService,
      );
      (
        authErrorHandler as unknown as { alertOnUserAlreadyRegistered: AlertError }
      ).alertOnUserAlreadyRegistered = new AlertError(mockAlertService).setErrorActionConfig({
        errorStatus: [HttpStatusCode.Conflict],
        predicate: (error: HttpErrorResponse) =>
          error.error?.message === AUTH_ERROR_CONSTANTS.UserExists ||
          error.message === AUTH_ERROR_CONSTANTS.UserExists,
        priority: 10,
        context: {
          message: "L' utente risulta già registrato!",
        },
      });
      authErrorHandler.setDefaultHandler(
        (authErrorHandler as unknown as { defaultAlert: AlertError }).defaultAlert,
      );
      authErrorHandler.addCustomHandler(
        (authErrorHandler as unknown as { alertOnUserAlreadyRegistered: AlertError })
          .alertOnUserAlreadyRegistered,
      );

      const error409 = new HttpErrorResponse({
        status: HttpStatusCode.Conflict,
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
  });
});
