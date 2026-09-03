export const ROUTE_SEGMENTS = {
  ROOT: '',
  LANDING: 'landing',
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  MENU: 'menu',
  QUOTES: 'quotes',
  SETTINGS: 'settings'
} as const;

export const APP_PATHS = {
  ROOT: '/',
  LANDING: `/${ROUTE_SEGMENTS.LANDING}`,
  LOGIN: `/${ROUTE_SEGMENTS.LOGIN}`,
  REGISTER: `/${ROUTE_SEGMENTS.REGISTER}`,
  DASHBOARD: {
    ROOT: `/${ROUTE_SEGMENTS.DASHBOARD}`,
    ADMIN: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.ADMIN}`,
    CUSTOMER: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.CUSTOMER}`,
  },
} as const;

export type RouteSegment = keyof typeof ROUTE_SEGMENTS;

export const RoutesIconsMap = new Map<RouteSegment, string>([
  ['MENU', 'heroBookOpen'],
  ['QUOTES', 'heroDocumentText'],
  ['SETTINGS', 'heroCog6Tooth'],
]);