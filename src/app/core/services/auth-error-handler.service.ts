import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_ENDPOINTS } from '../constants/api-endpoints.constant';
import { AUTH_ERROR_CONSTANTS } from '../constants/error.constant';
import { ALERT_DURATION, IAlertItem } from '../models/alert.model';
import { AlertService } from './alert.service';
import { AlertError, BaseErrorHandler } from './error-handlers';

/**
 * Domain-specific error handler service for authentication and user account operations.
 *
 * Extends {@link BaseErrorHandler} to manage error strategies for auth workflows including
 * login, registration, password management, and session refresh errors.
 */
@Service()
export class AuthErrorHandlerService extends BaseErrorHandler<Partial<IAlertItem>> {
  #alertService = inject(AlertService);

  /** Default fallback action that displays a generic error banner. */
  defaultAlert = new AlertError(this.#alertService);

  /** Specialized action triggered when an account registration conflicts with an existing email (409 Conflict on /auth/register). */
  alertOnUserAlreadyRegistered = new AlertError(this.#alertService).setErrorActionConfig({
    errorStatus: [HttpStatusCode.Conflict],
    urls: [API_ENDPOINTS.AUTH.REGISTER],
    predicate: (error: HttpErrorResponse) =>
      error.error?.message === AUTH_ERROR_CONSTANTS.UserExists ||
      error.message === AUTH_ERROR_CONSTANTS.UserExists,
    priority: 10,
    description: 'Runs when user is already registered and executes registration again',
    context: {
      message: "L' utente risulta già registrato!",
    },
  });

  /** Specialized action triggered when invalid credentials are provided during login (401 Unauthorized on /auth/login). */
  wrongCredentials = new AlertError(this.#alertService).setErrorActionConfig({
    errorStatus: [HttpStatusCode.Unauthorized],
    urls: [API_ENDPOINTS.AUTH.LOGIN],
    priority: 1,
    description: 'Runs when user inserts wrong email or password',
    context: {
      message: 'Le credenziali inserite non sono valide!',
      closeTime: ALERT_DURATION.SHORT,
    },
  });

  constructor() {
    super();
    this.setDefaultHandler(this.defaultAlert);
    this.addCustomHandler(this.alertOnUserAlreadyRegistered);
    this.addCustomHandler(this.wrongCredentials);
  }
}