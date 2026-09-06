import { signal, WritableSignal } from '@angular/core';
import { vi } from 'vitest';
import { ALERT_DURATION, AlertDuration, AlertIcon, IAlertItem } from '../models/alert.model';

export const mockAlertItem: IAlertItem = {
  id: 'test-alert-id-1',
  type: 'info',
  message: 'Test alert message',
  closeTime: ALERT_DURATION.SHORT,
  icon: null,
};

export class MockAlertService {
  #alertItems: WritableSignal<IAlertItem[]> = signal<IAlertItem[]>([]);
  readonly alerts = this.#alertItems.asReadonly();

  show = vi.fn((alert: Partial<IAlertItem>): string => {
    const id = alert.id ?? 'mock-alert-id';
    const newAlert: IAlertItem = {
      id,
      type: alert.type ?? 'info',
      message: alert.message ?? '',
      closeTime: alert.closeTime ?? ALERT_DURATION.SHORT,
      icon: alert.icon ?? null,
      ...alert,
    };
    this.#alertItems.update((items) => [...items, newAlert]);
    return id;
  });

  removeAlert = vi.fn((removedId: string): void => {
    this.#alertItems.update((items) => items.filter((item) => item.id !== removedId));
  });

  clear = vi.fn((): void => {
    this.#alertItems.set([]);
  });

  info = vi.fn(
    (
      message: string,
      closeTime: number | AlertDuration = ALERT_DURATION.SHORT,
      icon: AlertIcon | null = null,
    ): string => this.show({ message, closeTime, icon, type: 'info' }),
  );

  success = vi.fn(
    (
      message: string,
      closeTime: number | AlertDuration = ALERT_DURATION.SHORT,
      icon: AlertIcon | null = null,
    ): string => this.show({ message, closeTime, icon, type: 'success' }),
  );

  warning = vi.fn(
    (
      message: string,
      closeTime: number | AlertDuration = ALERT_DURATION.DEFAULT,
      icon: AlertIcon | null = null,
    ): string => this.show({ message, closeTime, icon, type: 'warning' }),
  );

  error = vi.fn(
    (
      message: string,
      closeTime: number | AlertDuration = ALERT_DURATION.LONG,
      icon: AlertIcon | null = null,
    ): string => this.show({ message, closeTime, icon, type: 'error' }),
  );

  /** Helper method for test setups to directly populate alert state */
  setAlerts(alerts: IAlertItem[]): void {
    this.#alertItems.set(alerts);
  }
}

export function createMockAlertService(): MockAlertService {
  return new MockAlertService();
}

export const mockAlertService = createMockAlertService();
