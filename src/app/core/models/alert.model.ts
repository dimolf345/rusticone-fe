import { ALERT_ICONS } from "../constants/alert-icons.constant";

export const ALERT_TYPES = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error'
} as const;


export const ALERT_DURATION = {
  NEVER: 0,
  SHORT: 3000,
  DEFAULT: 5000,
  LONG: 7000,
} as const;

export type AlertType = keyof typeof ALERT_TYPES;
export type AlertDuration = (typeof ALERT_DURATION)[keyof typeof ALERT_DURATION];
export type AlertIcon = (typeof ALERT_ICONS)[keyof typeof ALERT_ICONS];

export interface IAlertItem {
  type: AlertType;
  message: string;
  title?: string;
  closeTime: number | AlertDuration;
  icon?: AlertIcon | null;
  id?: string;
}