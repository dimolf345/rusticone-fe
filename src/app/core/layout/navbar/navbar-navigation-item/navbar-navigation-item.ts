import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBookOpen,
  heroCog6Tooth,
  heroDocumentText,
  heroHome,
} from '@ng-icons/heroicons/outline';
import { INavigationItem, ScreenSize } from '../../../models/layout.model';

@Component({
  selector: 'app-navbar-navigation-item',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [
    provideIcons({
      heroHome,
      heroBookOpen,
      heroDocumentText,
      heroCog6Tooth,
    }),
  ],
  templateUrl: './navbar-navigation-item.html',
  styleUrl: './navbar-navigation-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarNavigationItem {
  readonly item = input.required<INavigationItem>();
  readonly screenSize = input.required<ScreenSize>();
  readonly isCollapsed = input<boolean>(false);

  readonly isDesktop = computed(() => this.screenSize() === 'desktop');
  readonly isTablet = computed(() => this.screenSize() === 'tablet');
  readonly isMobile = computed(() => this.screenSize() === 'mobile');

  readonly showLabel = computed(() => !this.isDesktop() || !this.isCollapsed());

  readonly activeClass = computed(() =>
    this.isMobile() ? 'dock-active' : 'active-nav-item'
  );
}
