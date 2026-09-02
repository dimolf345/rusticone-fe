import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';
import {
  ErrorActionConfig,
  ErrorCallback,
  ErrorPredicate,
  IApiErrorHandler,
  IErrorAction,
} from '../../models/error-handler.model';

/**
 * Abstract base class representing a single error handling strategy.
 *
 * Implements the {@link IErrorAction} interface, providing configurable HTTP status filtering,
 * endpoint URL filtering, priority scoring, custom predicates, and optional context storage
 * with a fluent chaining API.
 *
 * @template TContext The type of contextual metadata accepted by the action.
 */
export abstract class BaseErrorAction<TContext = unknown> implements IErrorAction<TContext> {
  /** List of HTTP status codes that trigger this action (empty array matches any status). */
  errorStatus: HttpStatusCode[] = [];

  /** Optional list of API endpoint URL substrings that trigger this action (empty array matches any endpoint). */
  urls: string[] = [];

  /** Numeric priority used for sorting multiple matching actions (higher values execute first). Default is 100. */
  priority = 100;

  /** Optional predicate function to evaluate fine-grained conditions on the error response or context. */
  predicate?: ErrorPredicate<TContext>;

  /** Optional human-readable description for debugging or logging purposes. */
  description?: string;

  /** Pre-configured static context or default values for this action. */
  context?: TContext;

  /**
   * Executes the error handling logic. Must be implemented by concrete subclasses.
   *
   * @param error The HTTP error response.
   * @param context Optional runtime context provided at the dispatch callsite.
   */
  abstract execute(error: HttpErrorResponse, context?: TContext): unknown;

  /**
   * Configures properties on the error action using a configuration object.
   *
   * @param config The partial configuration settings to apply.
   * @returns `this` instance for method chaining.
   */
  setErrorActionConfig(config: ErrorActionConfig<TContext>): this {
    this.errorStatus = config?.errorStatus ?? [];
    this.urls = config?.urls ?? [];
    this.priority = config?.priority ?? 100;
    this.predicate = config?.predicate;
    this.description = config?.description;
    if (config?.context !== undefined) {
      this.context = config.context;
    }
    return this;
  }

  /**
   * Sets or overrides the pre-configured context metadata for this action.
   *
   * @param context The context metadata to associate with this action.
   * @returns `this` instance for method chaining.
   */
  setContext(context: TContext): this {
    this.context = context;
    return this;
  }
}

/**
 * Abstract base class for managing and dispatching API error actions.
 *
 * Implements the {@link IApiErrorHandler} interface using Angular WritableSignals for reactive
 * error action registration. Matches incoming {@link HttpErrorResponse} errors against registered
 * custom handlers sorted by descending priority, filtering by status code, API URL, and predicates,
 * and falling back to a default handler if no custom handler matches.
 *
 * @template TContext The type of contextual metadata managed by the handler.
 */
export abstract class BaseErrorHandler<TContext = unknown> implements IApiErrorHandler<TContext> {
  /** Reactive signal containing the list of registered custom error actions. */
  customErrorHandlers: WritableSignal<IErrorAction<TContext>[]> = signal([]);

  /** Reactive signal containing the default fallback error action. */
  defaultErrorHandler: WritableSignal<IErrorAction<TContext> | null> = signal(null);

  /**
   * Dispatches an HTTP error response to the highest-priority matching custom handler or default handler.
   *
   * @param httpError The HTTP error response to handle.
   * @param context Optional runtime context to pass to the matching action's `execute()` method.
   * @param callBack Optional callback invoked after handling completes.
   */
  handle(httpError: HttpErrorResponse, context?: TContext, callBack?: ErrorCallback): void {
    const { status } = httpError;

    // Sort by priority (higher priority first)
    const sortedHandlers = [...this.customErrorHandlers()].sort(
      (a, b) => b.priority - a.priority,
    );

    const errorHandler = sortedHandlers.find((handler) => {
      const statusMatches =
        handler.errorStatus.length === 0 || handler.errorStatus.includes(status);

      const urlMatches =
        !handler.urls ||
        handler.urls.length === 0 ||
        handler.urls.some((url) => httpError.url?.includes(url));

      const predicateMatches = handler.predicate ? handler.predicate(httpError, context) : true;

      return statusMatches && urlMatches && predicateMatches;
    });

    if (errorHandler) {
      errorHandler.execute(httpError, context);
      callBack?.(httpError);
      return;
    }

    const defaultHandler = this.defaultErrorHandler();
    if (defaultHandler) {
      defaultHandler.execute(httpError, context);
      callBack?.(httpError);
    }
  }

  /**
   * Registers a custom error action in the handler registry.
   *
   * @param newHandler The IErrorAction instance to add.
   * @returns `this` instance for method chaining.
   */
  addCustomHandler(newHandler: IErrorAction<TContext>): this {
    this.customErrorHandlers.update((handlers) => [...handlers, newHandler]);
    return this;
  }

  /**
   * Sets or clears the default fallback error action.
   *
   * @param handler The IErrorAction instance to set as default, or null to clear.
   * @returns `this` instance for method chaining.
   */
  setDefaultHandler(handler: IErrorAction<TContext> | null): this {
    this.defaultErrorHandler.set(handler);
    return this;
  }
}