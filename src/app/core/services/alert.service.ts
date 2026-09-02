import { Service, signal } from '@angular/core';
import { ALERT_ICONS } from '../constants/alert-icons.constant';
import {
  ALERT_DURATION,
  AlertDuration,
  AlertIcon,
  IAlertItem,
} from '../models/alert.model';

@Service()
export class AlertService {
  #alertItems = signal<IAlertItem[]>([]);
  readonly alerts = this.#alertItems.asReadonly();

  #baseAlert(): IAlertItem {
    return {
      type: 'info',
      message: 'Alert!',
      closeTime: ALERT_DURATION.SHORT,
      icon: null,
      id: crypto.randomUUID(),
    };
  }

  show(alert: Partial<IAlertItem>): string {
    const newAlert: IAlertItem = {
      ...this.#baseAlert(),
      ...alert,
      id: alert.id ?? crypto.randomUUID(),
    };

    this.#alertItems.update((alerts) => [...alerts, newAlert]);

    if (newAlert.closeTime > 0) {
      setTimeout(() => this.removeAlert(newAlert.id!), newAlert.closeTime);
    }

    return newAlert.id!;
  }

  removeAlert(removedId: string): void {
    this.#alertItems.update((alertsList) =>
      alertsList.filter(({ id }) => id !== removedId),
    );
  }

  clear(): void {
    this.#alertItems.set([]);
  }

  info(
    message: string,
    closeTime: number | AlertDuration = ALERT_DURATION.SHORT,
    icon: AlertIcon | null = ALERT_ICONS.info,
  ): string {
    return this.show({ message, closeTime, icon, type: 'info' });
  }

  success(
    message: string,
    closeTime: number | AlertDuration = ALERT_DURATION.SHORT,
    icon: AlertIcon | null = ALERT_ICONS.success,
  ): string {
    return this.show({ message, closeTime, icon, type: 'success' });
  }

  warning(
    message: string,
    closeTime: number | AlertDuration = ALERT_DURATION.DEFAULT,
    icon: AlertIcon | null = ALERT_ICONS.warning,
  ): string {
    return this.show({ message, closeTime, icon, type: 'warning' });
  }

  error(
    message: string,
    closeTime: number | AlertDuration = ALERT_DURATION.LONG,
    icon: AlertIcon | null = ALERT_ICONS.error,
  ): string {
    return this.show({ message, closeTime, icon, type: 'error' });
  }
}