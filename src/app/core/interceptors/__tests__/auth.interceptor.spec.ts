import {
  HttpClient,
  HttpContext,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constant';
import { AuthErrorHandlerService } from '../../services/auth-error-handler.service';
import { AuthService } from '../../services/auth.service';
import { authInterceptor, SKIP_AUTH_INTERCEPTOR } from '../auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let authErrorHandler: AuthErrorHandlerService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        AuthErrorHandlerService,
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    authErrorHandler = TestBed.inject(AuthErrorHandlerService);
    router = TestBed.inject(Router);

    vi.spyOn(router, 'navigate');
    vi.spyOn(authErrorHandler, 'handle');
    vi.spyOn(authService, 'setAnonymous');
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  describe('Authorization Header Injection', () => {
    it('should attach Bearer token when an access token is available', () => {
      authService.setAccessToken('valid-jwt-token');

      http.get('/api/products').subscribe();

      const req = httpMock.expectOne('/api/products');
      expect(req.request.headers.get('Authorization')).toBe('Bearer valid-jwt-token');
      req.flush([]);
    });

    it('should not attach Authorization header when access token is null', () => {
      authService.setAccessToken(null);

      http.get('/api/products').subscribe();

      const req = httpMock.expectOne('/api/products');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush([]);
    });

    it('should preserve existing Authorization header if explicitly set by caller', () => {
      authService.setAccessToken('service-token');

      http
        .get('/api/products', {
          headers: { Authorization: 'CustomHeader custom-val' },
        })
        .subscribe();

      const req = httpMock.expectOne('/api/products');
      expect(req.request.headers.get('Authorization')).toBe('CustomHeader custom-val');
      req.flush([]);
    });
  });

  describe('Exclusions & Bypasses', () => {
    it('should bypass interceptor error handling when SKIP_AUTH_INTERCEPTOR context is set', () => {
      let errorReceived = false;

      http
        .get('/api/custom-check', {
          context: new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true),
        })
        .subscribe({
          error: () => {
            errorReceived = true;
          },
        });

      const req = httpMock.expectOne('/api/custom-check');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(errorReceived).toBe(true);
      expect(authErrorHandler.handle).not.toHaveBeenCalled();
      expect(authService.setAnonymous).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not intercept 401 on /auth/login endpoint', () => {
      let errorReceived = false;

      http.post(`${API_ENDPOINTS.AUTH.LOGIN}`, {}).subscribe({
        error: () => {
          errorReceived = true;
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.AUTH.LOGIN);
      req.flush('Bad credentials', { status: 401, statusText: 'Unauthorized' });

      expect(errorReceived).toBe(true);
      expect(authErrorHandler.handle).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not intercept 401 on /auth/refresh endpoint to avoid refresh loops', () => {
      let errorReceived = false;

      http.post(`${API_ENDPOINTS.AUTH.REFRESH}`, {}).subscribe({
        error: () => {
          errorReceived = true;
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.AUTH.REFRESH);
      req.flush('Token expired', { status: 401, statusText: 'Unauthorized' });

      expect(errorReceived).toBe(true);
      expect(authErrorHandler.handle).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('401 Unauthorized Handling', () => {
    it('should dispatch to AuthErrorHandler and setAnonymous without redirecting on 401 for anonymous user', () => {
      authService.setAccessToken(null);
      let errorReceived = false;

      http.get('/api/protected-resource').subscribe({
        error: () => {
          errorReceived = true;
        },
      });

      const req = httpMock.expectOne('/api/protected-resource');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(errorReceived).toBe(true);
      expect(authErrorHandler.handle).toHaveBeenCalled();
      expect(authService.setAnonymous).toHaveBeenCalled();
      // Verifying NO automatic redirection:
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should attempt refresh and retry request with new token on 401 when token exists', async () => {
      authService.setAccessToken('expired-token');
      vi.spyOn(authService, 'refreshAccess').mockImplementation(async () => {
        authService.setAccessToken('new-refreshed-token');
        return true;
      });

      let responseData: unknown = null;
      http.get('/api/protected-resource').subscribe({
        next: (data) => {
          responseData = data;
        },
      });

      // Initial request fails with 401
      const initialReq = httpMock.expectOne('/api/protected-resource');
      initialReq.flush('Token expired', { status: 401, statusText: 'Unauthorized' });

      // Allow microtask resolution for refreshAccess promise
      await Promise.resolve();

      // Retry request should be dispatched with the new access token
      const retryReq = httpMock.expectOne('/api/protected-resource');
      expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-refreshed-token');
      retryReq.flush({ success: true });

      expect(responseData).toEqual({ success: true });
      expect(authErrorHandler.handle).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should clear credentials and dispatch to AuthErrorHandler without redirecting if refresh fails', async () => {
      authService.setAccessToken('expired-token');
      vi.spyOn(authService, 'refreshAccess').mockResolvedValue(false);

      let errorReceived = false;
      http.get('/api/protected-resource').subscribe({
        error: () => {
          errorReceived = true;
        },
      });

      const req = httpMock.expectOne('/api/protected-resource');
      req.flush('Token expired', { status: 401, statusText: 'Unauthorized' });

      await Promise.resolve();

      expect(errorReceived).toBe(true);
      expect(authService.setAnonymous).toHaveBeenCalled();
      expect(authErrorHandler.handle).toHaveBeenCalled();
      // Verifying NO automatic redirection:
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('403 Forbidden Handling', () => {
    it('should dispatch to AuthErrorHandler and not redirect on 403 Forbidden', () => {
      let errorReceived = false;

      http.get('/api/admin/restricted').subscribe({
        error: () => {
          errorReceived = true;
        },
      });

      const req = httpMock.expectOne('/api/admin/restricted');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      expect(errorReceived).toBe(true);
      expect(authErrorHandler.handle).toHaveBeenCalled();
      // Verifying NO automatic redirection:
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
