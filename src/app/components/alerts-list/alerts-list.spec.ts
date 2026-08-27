import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ALERT_DURATION } from '../../core/models/alert.model';
import { AlertService } from '../../core/services/alert.service';
import { AlertsList } from './alerts-list';

describe('AlertsList', () => {
  let component: AlertsList;
  let fixture: ComponentFixture<AlertsList>;
  let alertService: AlertService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsList],
      providers: [AlertService],
    }).compileComponents();

    alertService = TestBed.inject(AlertService);
    fixture = TestBed.createComponent(AlertsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render container when there are no alerts', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.alerts-container')).toBeNull();
  });

  it('should render alert items when alerts exist in AlertService', () => {
    alertService.show({
      title: 'Attenzione',
      message: 'Test alert message',
      type: 'warning',
      closeTime: ALERT_DURATION.NEVER,
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.alerts-container');
    const alertItems = compiled.querySelectorAll('app-alert-item');

    expect(container).toBeTruthy();
    expect(alertItems.length).toBe(1);
  });

  it('should dismiss an alert when onDismiss is called', () => {
    const id = alertService.show({
      message: 'Dismiss me',
      closeTime: ALERT_DURATION.NEVER,
    });
    fixture.detectChanges();

    expect(alertService.alerts().length).toBe(1);

    component.onDismiss(id);
    fixture.detectChanges();

    expect(alertService.alerts().length).toBe(0);
  });
});
