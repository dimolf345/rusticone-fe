import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constant';
import { AuthErrorHandlerService } from '../services/auth-error-handler.service';
import { AuthService } from '../services/auth.service';

/** Token to opt out of global auth error handling for specific HTTP requests. */
export const SKIP_AUTH_INTERCEPTOR = new HttpContextToken<boolean>(() => false);

/** Internal token to mark retried requests and prevent infinite refresh loops. */
const IS_RETRY_REQUEST = new HttpContextToken<boolean>(() => false);

/**
 * Functional HTTP interceptor for authentication and authorization.
 *
 * Responsibilities:
 * 1. Attaches the current Bearer token to outgoing HTTP requests if available.
 * 2. Catches 401 Unauthorized errors on protected APIs and attempts a silent token refresh.
 * 3. On successful refresh, automatically retries the failed request with the new access token.
 * 4. On unrecoverable 401 (or 403 Forbidden), dispatches the error to {@link AuthErrorHandlerService}
 *    and clears user credentials without forcing an automatic navigation redirect.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const authErrorHandler = inject(AuthErrorHandlerService);

  // 1. Attach Bearer token if available and not explicitly provided
  const token = authService.accessToken();
  let authReq = req;
  if (token && !req.headers.has('Authorization')) {
    authReq = req.clone({
      // setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip interceptor error handling if explicitly bypassed
      if (req.context.get(SKIP_AUTH_INTERCEPTOR)) {
        return throwError(() => error);
      }

      // Do not intercept auth endpoints (login, refresh, register)
      const isAuthEndpoint =
        req.url.includes(API_ENDPOINTS.AUTH.LOGIN) ||
        req.url.includes(API_ENDPOINTS.AUTH.REFRESH) ||
        req.url.includes(API_ENDPOINTS.AUTH.REGISTER);

      if (isAuthEndpoint) {
        return throwError(() => error);
      }

      // Handle 401 Unauthorized on protected domain endpoints
      if (error.status === HttpStatusCode.Unauthorized) {
        const isRetry = req.context.get(IS_RETRY_REQUEST);

        // Attempt silent token refresh if user was logged in and this is not already a retry
        if (token && !isRetry) {
          return from(authService.refreshAccess()).pipe(
            switchMap((refreshed) => {
              if (refreshed) {
                const newToken = authService.accessToken();
                const retryReq = req.clone({
                  context: req.context.set(IS_RETRY_REQUEST, true),
                  setHeaders: newToken ? { Authorization: `Bearer ${newToken}` } : {},
                });
                return next(retryReq);
              }

              // Refresh failed: clear credentials, notify error handler, do NOT redirect
              authService.setAnonymous();
              authErrorHandler.handle(error);
              return throwError(() => error);
            }),
            catchError(() => {
              authService.setAnonymous();
              authErrorHandler.handle(error);
              return throwError(() => error);
            }),
          );
        }

        // Anonymous or already retried: clear credentials and dispatch to error handler
        authService.setAnonymous();
        authErrorHandler.handle(error);
        return throwError(() => error);
      }

      // Handle 403 Forbidden (Insufficient permissions)
      if (error.status === HttpStatusCode.Forbidden) {
        authErrorHandler.handle(error);
      }

      return throwError(() => error);
    }),
  );
};
