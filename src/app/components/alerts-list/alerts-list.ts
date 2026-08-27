import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AlertService } from '../../core/services/alert.service';
import { AlertItemComponent } from './alert-item/alert-item';

@Component({
  selector: 'app-alerts-list',
  imports: [AlertItemComponent],
  templateUrl: './alerts-list.html',
  styleUrl: './alerts-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsList {
  #alertService = inject(AlertService);

  readonly alerts = this.#alertService.alerts;

  onDismiss(id: string): void {
    this.#alertService.removeAlert(id);
  }
}
