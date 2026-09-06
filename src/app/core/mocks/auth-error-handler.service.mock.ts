import { HttpErrorResponse } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';
import { vi } from 'vitest';
import { IAlertItem } from '../models/alert.model';
import { IErrorAction } from '../models/error-handler.model';

export class MockAuthErrorHandlerService {
  #customErrorHandlers: WritableSignal<IErrorAction<Partial<IAlertItem>>[]> = signal([]);
  #defaultErrorHandler: WritableSignal<IErrorAction<Partial<IAlertItem>> | null> = signal(null);

  readonly customErrorHandlers = this.#customErrorHandlers.asReadonly();
  readonly defaultErrorHandler = this.#defaultErrorHandler.asReadonly();

  defaultAlert = {
    errorStatus: undefined,
    priority: 0,
    description: 'Default alert',
    predicate: undefined,
    urls: undefined,
    context: {},
    execute: vi.fn(),
    setErrorActionConfig: vi.fn().mockReturnThis(),
    setContext: vi.fn().mockReturnThis(),
  };

  alertOnUserAlreadyRegistered = {
    errorStatus: [409],
    priority: 10,
    description: 'Runs when user is already registered and executes registration again',
    predicate: vi.fn(),
    urls: ['/auth/register'],
    context: { message: "L' utente risulta già registrato!" },
    execute: vi.fn(),
    setErrorActionConfig: vi.fn().mockReturnThis(),
    setContext: vi.fn().mockReturnThis(),
  };

  wrongCredentials = {
    errorStatus: [401],
    priority: 1,
    description: 'Runs when user inserts wrong email or password',
    predicate: vi.fn(),
    urls: ['/auth/login'],
    context: { message: 'Le credenziali inserite non sono valide!' },
    execute: vi.fn(),
    setErrorActionConfig: vi.fn().mockReturnThis(),
    setContext: vi.fn().mockReturnThis(),
  };

  addCustomHandler = vi.fn((handler: IErrorAction<Partial<IAlertItem>>): void => {
    this.#customErrorHandlers.update((handlers) => [...handlers, handler]);
  });

  setDefaultHandler = vi.fn((handler: IErrorAction<Partial<IAlertItem>>): void => {
    this.#defaultErrorHandler.set(handler);
  });

  handle = vi.fn(
    (
      _error: HttpErrorResponse,
      _context?: Partial<IAlertItem>,
      callback?: (error: HttpErrorResponse) => void,
    ): void => {
      callback?.(_error);
    },
  );
}

export function createMockAuthErrorHandlerService(): MockAuthErrorHandlerService {
  return new MockAuthErrorHandlerService();
}

export const mockAuthErrorHandlerService = createMockAuthErrorHandlerService();
