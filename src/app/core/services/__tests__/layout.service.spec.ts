import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BREAKPOINTS, LAYOUT_STORAGE_KEYS } from '../../models/layout.model';
import { LayoutService } from '../layout.service';

describe('LayoutService', () => {
  let service: LayoutService;
  let listeners: Record<string, ((event: MediaQueryListEvent) => void)[]> = {};

  const createMockMql = (matches: boolean, query: string): MediaQueryList => {
    listeners[query] = [];
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          listeners[query].push(callback);
        }
      }),
      removeEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          listeners[query] = listeners[query].filter((cb) => cb !== callback);
        }
      }),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
  };

  const setupMatchMedia = (activeQuery: string): void => {
    const matchMediaMock = (query: string): MediaQueryList => {
      return createMockMql(query === activeQuery, query);
    };
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(matchMediaMock),
    });
  };

  beforeEach(() => {
    listeners = {};
    setupMatchMedia(BREAKPOINTS.DESKTOP);

    TestBed.configureTestingModule({
      providers: [LayoutService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });

    service = TestBed.inject(LayoutService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created and default to desktop', () => {
    expect(service).toBeTruthy();
    expect(service.screenSize()).toBe('desktop');
    expect(service.isDesktop()).toBe(true);
    expect(service.isMobile()).toBe(false);
    expect(service.isTablet()).toBe(false);
  });

  describe('Breakpoint handling', () => {
    it('should detect mobile when mobile media query matches', () => {
      TestBed.resetTestingModule();
      setupMatchMedia(BREAKPOINTS.MOBILE);

      TestBed.configureTestingModule({
        providers: [LayoutService, { provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const mobileService = TestBed.inject(LayoutService);

      expect(mobileService.screenSize()).toBe('mobile');
      expect(mobileService.isMobile()).toBe(true);
      expect(mobileService.isTablet()).toBe(false);
      expect(mobileService.isDesktop()).toBe(false);
    });

    it('should detect tablet and default sidebar to collapsed if not in localStorage', () => {
      TestBed.resetTestingModule();
      setupMatchMedia(BREAKPOINTS.TABLET);

      TestBed.configureTestingModule({
        providers: [LayoutService, { provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const tabletService = TestBed.inject(LayoutService);

      expect(tabletService.screenSize()).toBe('tablet');
      expect(tabletService.isTablet()).toBe(true);
      expect(tabletService.isSidebarCollapsed()).toBe(true);
    });

    it('should react when media query listeners trigger change event', () => {
      const mobileMql = createMockMql(false, BREAKPOINTS.MOBILE);
      const tabletMql = createMockMql(false, BREAKPOINTS.TABLET);
      const desktopMql = createMockMql(true, BREAKPOINTS.DESKTOP);

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => {
          if (query === BREAKPOINTS.MOBILE) return mobileMql;
          if (query === BREAKPOINTS.TABLET) return tabletMql;
          return desktopMql;
        }),
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [LayoutService, { provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const reactiveService = TestBed.inject(LayoutService);

      expect(reactiveService.screenSize()).toBe('desktop');

      // Simulate resize to mobile
      Object.defineProperty(mobileMql, 'matches', { value: true, configurable: true });
      Object.defineProperty(desktopMql, 'matches', { value: false, configurable: true });
      listeners[BREAKPOINTS.MOBILE].forEach((cb) => cb({ matches: true } as MediaQueryListEvent));

      expect(reactiveService.screenSize()).toBe('mobile');
      expect(reactiveService.isMobile()).toBe(true);
    });
  });

  describe('Sidebar controls & persistence', () => {
    it('should read initial collapsed state from global localStorage', () => {
      localStorage.setItem(LAYOUT_STORAGE_KEYS.SIDEBAR_COLLAPSED, 'true');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [LayoutService, { provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const customService = TestBed.inject(LayoutService);

      expect(customService.isSidebarCollapsed()).toBe(true);
    });

    it('should toggle sidebar and persist state to localStorage', () => {
      expect(service.isSidebarCollapsed()).toBe(false);

      service.toggleSidebar();
      expect(service.isSidebarCollapsed()).toBe(true);
      expect(localStorage.getItem(LAYOUT_STORAGE_KEYS.SIDEBAR_COLLAPSED)).toBe('true');

      service.toggleSidebar();
      expect(service.isSidebarCollapsed()).toBe(false);
      expect(localStorage.getItem(LAYOUT_STORAGE_KEYS.SIDEBAR_COLLAPSED)).toBe('false');
    });

    it('should collapse and expand sidebar', () => {
      service.collapseSidebar();
      expect(service.isSidebarCollapsed()).toBe(true);

      service.expandSidebar();
      expect(service.isSidebarCollapsed()).toBe(false);
    });
  });

  describe('Mobile drawer controls', () => {
    it('should toggle, open, and close mobile drawer', () => {
      expect(service.isMobileDrawerOpen()).toBe(false);

      service.openMobileDrawer();
      expect(service.isMobileDrawerOpen()).toBe(true);

      service.closeMobileDrawer();
      expect(service.isMobileDrawerOpen()).toBe(false);

      service.toggleMobileDrawer();
      expect(service.isMobileDrawerOpen()).toBe(true);

      service.toggleMobileDrawer();
      expect(service.isMobileDrawerOpen()).toBe(false);
    });
  });

  describe('SSR Safety', () => {
    it('should safely initialize on non-browser platforms without errors', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [LayoutService, { provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverService = TestBed.inject(LayoutService);
      expect(serverService).toBeTruthy();
      expect(serverService.screenSize()).toBe('desktop');
      expect(serverService.isSidebarCollapsed()).toBe(false);

      serverService.toggleSidebar();
      expect(serverService.isSidebarCollapsed()).toBe(true);
    });
  });
});
