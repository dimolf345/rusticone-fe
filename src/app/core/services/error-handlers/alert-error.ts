import { HttpErrorResponse } from '@angular/common/http';
import { ALERT_DURATION, AlertItem } from '../../models/alert.model';
import { AlertService } from '../alert.service';
import { BaseErrorAction } from './base-error';

/**
 * Concrete error action that presents user-facing feedback notifications via {@link AlertService}.
 *
 * Merges default settings, static pre-configured action context, and dynamic runtime context to display
 * contextual alert banners (e.g. error, warning, info) with customizable durations and icons.
 */
export class AlertError extends BaseErrorAction<Partial<AlertItem>> {
  #alertService: AlertService;

  override context: AlertItem = {
    type: 'error',
    message: 'Si è verificato un errore',
    closeTime: ALERT_DURATION.DEFAULT,
    icon: null,
  };

  /**
   * Initializes a new AlertError action.
   *
   * @param alertService The injected {@link AlertService} used to render alert banners.
   * @param defaultContext Optional base alert parameters to override defaults upon instantiation.
   */
  constructor(alertService: AlertService, defaultContext?: Partial<AlertItem>) {
    super();
    this.#alertService = alertService;
    if (defaultContext) {
      this.context = { ...this.context, ...defaultContext };
    }
  }

  /**
   * Executes the alert action, merging default context, configured context, and runtime overrides.
   * Extracts the most relevant message from backend payload `error.error?.message` before falling back to `error.message`.
   *
   * @param error The HTTP error response.
   * @param context Optional runtime context provided at the dispatch callsite.
   */
  override execute(error: HttpErrorResponse, context?: Partial<AlertItem>): void {
    const mergedContext: Partial<AlertItem> = {
      ...this.context,
      ...context,
    };

    const message =
      mergedContext.message ||
      error.error?.message ||
      (typeof error.error === 'string' ? error.error : null) ||
      error.message ||
      'Si è verificato un errore';

    const closeTime = mergedContext.closeTime ?? ALERT_DURATION.DEFAULT;
    const type = mergedContext.type ?? 'error';

    this.#alertService.show({
      ...mergedContext,
      message,
      closeTime,
      type,
    });
  }
}