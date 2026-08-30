export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export interface LayoutBreakpoint {
  name: ScreenSize;
  mediaQuery: string;
}

export const BREAKPOINTS = {
  MOBILE: '(max-width: 767px)',
  TABLET: '(min-width: 768px) and (max-width: 1023px)',
  DESKTOP: '(min-width: 1024px)',
} as const;

export const LAYOUT_STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: 'rusticone_sidebar_collapsed',
} as const;
