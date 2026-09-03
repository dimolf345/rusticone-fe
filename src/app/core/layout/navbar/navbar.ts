import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronLeft,
  heroChevronRight,
} from '@ng-icons/heroicons/outline';
import { INavigationItem, ScreenSize } from '../../models/layout.model';
import { LayoutService } from '../../services/layout.service';
import { NavbarNavigationItem } from './navbar-navigation-item/navbar-navigation-item';

@Component({
  selector: 'app-navbar',
  imports: [NavbarNavigationItem, NgIcon],
  providers: [
    provideIcons({
      heroChevronLeft,
      heroChevronRight,
    }),
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  #layoutService = inject(LayoutService);

  readonly screenSize = input.required<ScreenSize>();
  readonly navigationItems = input<INavigationItem[]>([]);

  readonly isSidebarCollapsed = this.#layoutService.isSidebarCollapsed;

  toggleSidebar(): void {
    if (this.screenSize() === 'desktop') {
      this.#layoutService.toggleSidebar();
    }
  }
}



