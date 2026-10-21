import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IPopoverMenuAction } from '@core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroEllipsisVertical } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-popover-menu',
  imports: [NgIcon],
  templateUrl: './popover-menu.html',
  styleUrl: './popover-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroEllipsisVertical,
    }),
  ],
})
export class PopoverMenu {
  readonly #instanceId = Math.random().toString(36).substring(2, 9);

  // Inputs
  readonly actions = input<IPopoverMenuAction[]>([]);
  readonly ariaLabel = input<string>('Azioni');
  readonly testId = input<string>('Popover Menu');
  readonly icon = input<string>('heroEllipsisVertical');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly buttonClass = input<string>('');

  // Outputs
  readonly action = output<IPopoverMenuAction>();

  // Computed
  readonly composedTestId = computed(() => `${this.testId()} - `);
  readonly popoverId = computed(
    () => `popover-menu-${this.testId().toLowerCase().replace(/[^a-z0-9]/g, '-')}-${this.#instanceId}`
  );

  onActionItemClick(
    action: IPopoverMenuAction,
    popover: HTMLElement,
    event: Event
  ): void {
    event.stopPropagation();

    if (popover.matches(':popover-open')) {
      popover.hidePopover();
    }

    this.action.emit(action);
  }

  onPopoverToggle(event: ToggleEvent, button: HTMLElement, popover: HTMLElement): void {
    if (event.newState !== 'open') return;

    const GAP = 6;
    const VIEWPORT_PADDING = 8;

    const { top, bottom, right } = button.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = popover;

    const preferredTop = bottom + GAP;
    const preferredLeft = right - width;

    const popoverTop =
      preferredTop + height > window.innerHeight
        ? top - height - GAP
        : preferredTop;

    const popoverLeft = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        preferredLeft,
        window.innerWidth - width - VIEWPORT_PADDING
      )
    );

    Object.assign(popover.style, {
      position: 'fixed',
      top: `${Math.max(VIEWPORT_PADDING, popoverTop)}px`,
      left: `${popoverLeft}px`,
      margin: '0',
      zIndex: '100',
    });
  }
}
