import { vi } from 'vitest';
import { BaseErrorAction, BaseErrorHandler } from '../services/error-handlers';

export class MockErrorAction<T = unknown> extends BaseErrorAction<T> {
  override execute = vi.fn();
}

export class MockErrorHandler<T = unknown> extends BaseErrorHandler<T> {}
