import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ALERT_ICONS } from '../../../core/constants/alert-icons.constant';
import { ALERT_DURATION, IAlertItem } from '../../../core/models/alert.model';
import { AlertItemComponent } from './alert-item';

describe('AlertItemComponent', () => {
  let component: AlertItemComponent;
  let fixture: ComponentFixture<AlertItemComponent>;

  const mockAlert: IAlertItem = {
    id: 'test-123',
    type: 'error',
    title: 'Accesso negato',
    message: 'Nome utente o password non corretti.',
    closeTime: ALERT_DURATION.SHORT,
    icon: ALERT_ICONS.error,
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [AlertItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('alert', mockAlert);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the alert title and message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleEl = compiled.querySelector('.alert-title');
    const messageEl = compiled.querySelector('.alert-message');

    expect(titleEl?.textContent).toContain('Accesso negato');
    expect(messageEl?.textContent).toContain('Nome utente o password non corretti.');
  });

  it('should apply the correct alert type class', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const alertCard = compiled.querySelector('.alert-card');

    expect(alertCard?.classList.contains('alert-error')).toBe(true);
  });

  it('should render progress bar when closeTime > 0', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const progressBar = compiled.querySelector('.alert-progress-bar');

    expect(progressBar).toBeTruthy();
    expect(component.hasProgress()).toBe(true);
  });

  it('should not render progress bar when closeTime is NEVER (0)', () => {
    fixture.componentRef.setInput('alert', {
      ...mockAlert,
      closeTime: ALERT_DURATION.NEVER,
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const progressBar = compiled.querySelector('.alert-progress-bar');

    expect(progressBar).toBeFalsy();
    expect(component.hasProgress()).toBe(false);
  });

  it('should emit dismissed output after delay when dismiss button is clicked', () => {
    let emittedId: string | undefined;
    component.dismissed.subscribe((id) => {
      emittedId = id;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const closeBtn = compiled.querySelector('.alert-close-btn') as HTMLButtonElement;
    closeBtn.click();

    expect(component.isLeaving()).toBe(true);

    vi.advanceTimersByTime(200);
    expect(emittedId).toBe('test-123');
  });
});
