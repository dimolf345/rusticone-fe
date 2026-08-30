import { isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { BREAKPOINTS, LAYOUT_STORAGE_KEYS, ScreenSize } from '../models/layout.model';

@Service()
export class LayoutService {
  #platformId = inject(PLATFORM_ID);
  #destroyRef = inject(DestroyRef);

  #screenSize = signal<ScreenSize>('desktop');
  readonly screenSize = this.#screenSize.asReadonly();

  readonly isMobile = computed(() => this.#screenSize() === 'mobile');
  readonly isTablet = computed(() => this.#screenSize() === 'tablet');
  readonly isDesktop = computed(() => this.#screenSize() === 'desktop');

  #isSidebarCollapsed = signal<boolean>(false);
  readonly isSidebarCollapsed = this.#isSidebarCollapsed.asReadonly();

  #isMobileDrawerOpen = signal<boolean>(false);
  readonly isMobileDrawerOpen = this.#isMobileDrawerOpen.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.#platformId)) {
      this.#initBreakpoints();
      this.#initSidebarState();
    }
  }

  #initBreakpoints(): void {
    const mobileMql = window.matchMedia(BREAKPOINTS.MOBILE);
    const tabletMql = window.matchMedia(BREAKPOINTS.TABLET);
    const desktopMql = window.matchMedia(BREAKPOINTS.DESKTOP);

    const updateScreenSize = (): void => {
      if (mobileMql.matches) {
        this.#screenSize.set('mobile');
      } else if (tabletMql.matches) {
        this.#screenSize.set('tablet');
      } else {
        this.#screenSize.set('desktop');
      }
    };

    updateScreenSize();

    const handleMediaChange = (): void => updateScreenSize();
    mobileMql.addEventListener('change', handleMediaChange);
    tabletMql.addEventListener('change', handleMediaChange);
    desktopMql.addEventListener('change', handleMediaChange);

    this.#destroyRef.onDestroy(() => {
      mobileMql.removeEventListener('change', handleMediaChange);
      tabletMql.removeEventListener('change', handleMediaChange);
      desktopMql.removeEventListener('change', handleMediaChange);
    });
  }

  #initSidebarState(): void {
    try {
      const saved = window.localStorage.getItem(LAYOUT_STORAGE_KEYS.SIDEBAR_COLLAPSED);
      if (saved !== null) {
        this.#isSidebarCollapsed.set(saved === 'true');
      } else {
        this.#isSidebarCollapsed.set(this.isTablet());
      }
    } catch {
      this.#isSidebarCollapsed.set(false);
    }
  }

  toggleSidebar(): void {
    this.setSidebarCollapsed(!this.#isSidebarCollapsed());
  }

  collapseSidebar(): void {
    this.setSidebarCollapsed(true);
  }

  expandSidebar(): void {
    this.setSidebarCollapsed(false);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.#isSidebarCollapsed.set(collapsed);
    if (isPlatformBrowser(this.#platformId)) {
      try {
        window.localStorage.setItem(LAYOUT_STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
      } catch {
        // Ignore localStorage quota or access errors
      }
    }
  }

  toggleMobileDrawer(): void {
    this.#isMobileDrawerOpen.update((open) => !open);
  }

  openMobileDrawer(): void {
    this.#isMobileDrawerOpen.set(true);
  }

  closeMobileDrawer(): void {
    this.#isMobileDrawerOpen.set(false);
  }
}
