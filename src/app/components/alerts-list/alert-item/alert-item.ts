import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCheckCircle,
  heroExclamationTriangle,
  heroInformationCircle,
  heroXCircle,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { AlertItem } from '../../../core/models/alert.model';

@Component({
  selector: 'app-alert-item',
  imports: [NgIcon],
  templateUrl: './alert-item.html',
  styleUrl: './alert-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroInformationCircle,
      heroCheckCircle,
      heroExclamationTriangle,
      heroXCircle,
      heroXMark,
    }),
  ],
})
export class AlertItemComponent {
  readonly alert = input.required<AlertItem>();
  readonly dismissed = output<string>();

  readonly isLeaving = signal(false);

  readonly hasProgress = computed(() => {
    const closeTime = Number(this.alert().closeTime);
    return closeTime > 0;
  });

  readonly alertTypeClass = computed(() => `alert-${this.alert().type}`);

  onDismiss(): void {
    if (this.isLeaving()) return;
    this.isLeaving.set(true);
    setTimeout(() => {
      if (this.alert().id) {
        this.dismissed.emit(this.alert().id!);
      }
    }, 200);
  }
}
