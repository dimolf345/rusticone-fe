import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ALERT_ICONS } from '../../constants/alert-icons.constant';
import { ALERT_DURATION } from '../../models/alert.model';
import { AlertService } from '../alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [AlertService],
    });
    service = TestBed.inject(AlertService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should be created and have empty alerts by default', () => {
    expect(service).toBeTruthy();
    expect(service.alerts()).toEqual([]);
  });

  describe('show', () => {
    it('should add an alert with default base values and return the generated id', () => {
      const id = service.show({});

      expect(typeof id).toBe('string');
      expect(service.alerts().length).toBe(1);

      const alert = service.alerts()[0];
      expect(alert.id).toBe(id);
      expect(alert.message).toBe('Alert!');
      expect(alert.type).toBe('info');
      expect(alert.closeTime).toBe(ALERT_DURATION.SHORT);
      expect(alert.icon).toBeNull();
    });

    it('should preserve a custom provided id', () => {
      const customId = 'custom-alert-id';
      const id = service.show({ id: customId, message: 'Custom ID alert' });

      expect(id).toBe(customId);
      expect(service.alerts()[0].id).toBe(customId);
    });

    it('should automatically remove the alert after closeTime expires', () => {
      service.show({ message: 'Auto-closing alert', closeTime: 3000 });
      expect(service.alerts().length).toBe(1);

      vi.advanceTimersByTime(2999);
      expect(service.alerts().length).toBe(1);

      vi.advanceTimersByTime(1);
      expect(service.alerts().length).toBe(0);
    });

    it('should not automatically remove the alert when closeTime is NEVER (0)', () => {
      service.show({ message: 'Persistent alert', closeTime: ALERT_DURATION.NEVER });
      expect(service.alerts().length).toBe(1);

      vi.advanceTimersByTime(100000);
      expect(service.alerts().length).toBe(1);
    });
  });

  describe('helper methods', () => {
    it('should create an info alert with default duration and icon', () => {
      const id = service.info('Informational message');

      expect(service.alerts().length).toBe(1);
      const alert = service.alerts()[0];
      expect(alert.id).toBe(id);
      expect(alert.type).toBe('info');
      expect(alert.message).toBe('Informational message');
      expect(alert.closeTime).toBe(ALERT_DURATION.SHORT);
      expect(alert.icon).toBe(ALERT_ICONS.info);
    });

    it('should create a success alert with default duration and icon', () => {
      const id = service.success('Success message');

      expect(service.alerts().length).toBe(1);
      const alert = service.alerts()[0];
      expect(alert.id).toBe(id);
      expect(alert.type).toBe('success');
      expect(alert.message).toBe('Success message');
      expect(alert.closeTime).toBe(ALERT_DURATION.SHORT);
      expect(alert.icon).toBe(ALERT_ICONS.success);
    });

    it('should create a warning alert with default duration and icon', () => {
      const id = service.warning('Warning message');

      expect(service.alerts().length).toBe(1);
      const alert = service.alerts()[0];
      expect(alert.id).toBe(id);
      expect(alert.type).toBe('warning');
      expect(alert.message).toBe('Warning message');
      expect(alert.closeTime).toBe(ALERT_DURATION.DEFAULT);
      expect(alert.icon).toBe(ALERT_ICONS.warning);
    });

    it('should create an error alert with default duration and icon', () => {
      const id = service.error('Error message');

      expect(service.alerts().length).toBe(1);
      const alert = service.alerts()[0];
      expect(alert.id).toBe(id);
      expect(alert.type).toBe('error');
      expect(alert.message).toBe('Error message');
      expect(alert.closeTime).toBe(ALERT_DURATION.LONG);
      expect(alert.icon).toBe(ALERT_ICONS.error);
    });

    it('should allow overriding closeTime and icon in helper methods', () => {
      service.success('Custom success', ALERT_DURATION.LONG, null);

      const alert = service.alerts()[0];
      expect(alert.closeTime).toBe(ALERT_DURATION.LONG);
      expect(alert.icon).toBeNull();
    });
  });

  describe('removeAlert and clear', () => {
    it('should remove specific alert by id', () => {
      const id1 = service.info('First');
      const id2 = service.error('Second');
      const id3 = service.success('Third');

      expect(service.alerts().length).toBe(3);

      service.removeAlert(id2);

      const remaining = service.alerts();
      expect(remaining.length).toBe(2);
      expect(remaining.map((a) => a.id)).toEqual([id1, id3]);
    });

    it('should not mutate alerts if removeAlert is called with a non-existent id', () => {
      service.info('First');
      expect(service.alerts().length).toBe(1);

      service.removeAlert('non-existent-id');
      expect(service.alerts().length).toBe(1);
    });

    it('should clear all alerts when clear is called', () => {
      service.info('First');
      service.error('Second');
      service.success('Third');
      expect(service.alerts().length).toBe(3);

      service.clear();
      expect(service.alerts()).toEqual([]);
    });
  });
});
