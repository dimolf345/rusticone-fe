import { computed, signal, WritableSignal } from '@angular/core';
import { vi } from 'vitest';
import { ScreenSize } from '../models/layout.model';

export class MockLayoutService {
  #screenSize: WritableSignal<ScreenSize> = signal<ScreenSize>('desktop');
  #isSidebarCollapsed: WritableSignal<boolean> = signal<boolean>(false);
  #isMobileDrawerOpen: WritableSignal<boolean> = signal<boolean>(false);

  readonly screenSize = this.#screenSize.asReadonly();
  readonly isMobile = computed(() => this.#screenSize() === 'mobile');
  readonly isTablet = computed(() => this.#screenSize() === 'tablet');
  readonly isDesktop = computed(() => this.#screenSize() === 'desktop');
  readonly isSidebarCollapsed = this.#isSidebarCollapsed.asReadonly();
  readonly isMobileDrawerOpen = this.#isMobileDrawerOpen.asReadonly();

  setScreenSize = vi.fn((size: ScreenSize): void => {
    this.#screenSize.set(size);
  });

  toggleSidebar = vi.fn((): void => {
    this.#isSidebarCollapsed.update((collapsed) => !collapsed);
  });

  collapseSidebar = vi.fn((): void => {
    this.#isSidebarCollapsed.set(true);
  });

  expandSidebar = vi.fn((): void => {
    this.#isSidebarCollapsed.set(false);
  });

  setSidebarCollapsed = vi.fn((collapsed: boolean): void => {
    this.#isSidebarCollapsed.set(collapsed);
  });

  toggleMobileDrawer = vi.fn((): void => {
    this.#isMobileDrawerOpen.update((open) => !open);
  });

  openMobileDrawer = vi.fn((): void => {
    this.#isMobileDrawerOpen.set(true);
  });

  closeMobileDrawer = vi.fn((): void => {
    this.#isMobileDrawerOpen.set(false);
  });
}

export function createMockLayoutService(
  initialScreenSize: ScreenSize = 'desktop',
): MockLayoutService {
  const service = new MockLayoutService();
  service.setScreenSize(initialScreenSize);
  return service;
}

export const mockLayoutService = createMockLayoutService();
