import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { WritableSignal } from '@angular/core';

/**
 * Predicate function used to evaluate whether an ErrorAction should handle a specific HttpErrorResponse.
 *
 * @template TContext The type of additional context passed during error evaluation.
 * @param error The HTTP error response returned by the backend or HttpClient.
 * @param context Optional context containing relevant request or payload metadata.
 * @returns `true` if the action should handle this error, `false` otherwise.
 */
export type ErrorPredicate<TContext = unknown> = (
  error: HttpErrorResponse,
  context?: TContext,
) => boolean;

/**
 * Callback function invoked after an error action has completed execution.
 *
 * @param error The HTTP error response that was handled.
 */
export type ErrorCallback = (error: HttpErrorResponse) => void;

/**
 * Configuration options for initializing or updating an ErrorAction.
 *
 * @template TContext The type of additional context used by the action.
 */
export type ErrorActionConfig<TContext = unknown> = Partial<Omit<ErrorAction<TContext>, 'execute'>>;

/**
 * Represents an individual error action strategy designed to handle specific HTTP errors.
 *
 * @template TContext The type of contextual metadata accepted by the action.
 */
export interface ErrorAction<TContext = unknown> {
  /** List of HTTP status codes that trigger this action (empty array matches any status). */
  errorStatus: HttpStatusCode[];

  /** Numeric priority used for sorting multiple matching actions (higher values execute first). */
  priority: number;

  /** Optional fine-grained condition function to validate error payload or context. */
  predicate?: ErrorPredicate<TContext>;

  /** Optional human-readable description of what this error action handles. */
  description?: string;

  /** Optional pre-configured static context or default values for this action. */
  context?: TContext;

  /**
   * Executes the error handling logic (e.g., displaying an alert, redirecting, logging).
   *
   * @param error The HTTP error response.
   * @param context Optional runtime context provided at the callsite.
   */
  execute(error: HttpErrorResponse, context?: TContext): unknown;
}

/**
 * Service contract responsible for registering, sorting, and dispatching error actions.
 *
 * @template TContext The type of contextual metadata managed by the handler.
 */
export interface ApiErrorHandler<TContext = unknown> {
  /** Reactive signal containing the list of registered custom error actions. */
  customErrorHandlers: WritableSignal<ErrorAction<TContext>[]>;

  /** Reactive signal containing the fallback error action when no custom action matches. */
  defaultErrorHandler: WritableSignal<ErrorAction<TContext> | null>;

  /**
   * Dispatches an HTTP error to the highest-priority matching custom action or default fallback.
   *
   * @param httpError The HTTP error response to handle.
   * @param context Optional runtime context to pass to the matching action.
   * @param callBack Optional callback invoked after handling completes.
   */
  handle(httpError: HttpErrorResponse, context?: TContext, callBack?: ErrorCallback): void;

  /**
   * Registers a custom error action in the handler's registry.
   *
   * @param handler The ErrorAction instance to add.
   * @returns The handler instance for method chaining.
   */
  addCustomHandler(handler: ErrorAction<TContext>): ApiErrorHandler<TContext>;

  /**
   * Sets or clears the default fallback error action.
   *
   * @param handler The fallback ErrorAction instance, or null to clear.
   * @returns The handler instance for method chaining.
   */
  setDefaultHandler?(handler: ErrorAction<TContext> | null): ApiErrorHandler<TContext>;
}