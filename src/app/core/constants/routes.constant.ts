import { INavigationItem } from "../models/layout.model";

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
    ADMIN_MENU: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.ADMIN}/${ROUTE_SEGMENTS.MENU}`,
    ADMIN_QUOTES: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.ADMIN}/${ROUTE_SEGMENTS.QUOTES}`,
    CUSTOMER: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.CUSTOMER}`,
    CUSTOMER_MENU: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.CUSTOMER}/${ROUTE_SEGMENTS.MENU}`,
    CUSTOMER_QUOTES: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.CUSTOMER}/${ROUTE_SEGMENTS.QUOTES}`,
    SETTINGS: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.SETTINGS}`,
  },
} as const;

export type RouteSegment = keyof typeof ROUTE_SEGMENTS;

export const RoutesIconsMap = new Map<RouteSegment, string>([
  ['MENU', 'heroBookOpen'],
  ['QUOTES', 'heroDocumentText'],
  ['SETTINGS', 'heroCog6Tooth'],
  ['DASHBOARD', 'heroHome'],
]);

export const ADMIN_NAVITEMS: INavigationItem[] = [
  {
    label: 'Home',
    route: APP_PATHS.DASHBOARD.ADMIN,
    icon: RoutesIconsMap.get('DASHBOARD'),
    exact: true,
  },
  {
    label: 'Menu',
    route: APP_PATHS.DASHBOARD.ADMIN_MENU,
    icon: RoutesIconsMap.get('MENU'),
    exact: true,
  },
  {
    label: 'Preventivi',
    route: APP_PATHS.DASHBOARD.ADMIN_QUOTES,
    icon: RoutesIconsMap.get('QUOTES'),
    exact: true,
  },
  {
    label: 'Impostazioni',
    route: APP_PATHS.DASHBOARD.SETTINGS,
    icon: RoutesIconsMap.get('SETTINGS'),
    exact: true,
  },
];

export const CUSTOMER_NAVITEMS: INavigationItem[] = [
  {
    label: 'Home',
    route: APP_PATHS.DASHBOARD.CUSTOMER,
    icon: RoutesIconsMap.get('DASHBOARD'),
    exact: true,
  },
  {
    label: 'Menu',
    route: APP_PATHS.DASHBOARD.CUSTOMER_MENU,
    icon: RoutesIconsMap.get('MENU'),
    exact: true,
  },
  {
    label: 'Buffet',
    route: APP_PATHS.DASHBOARD.CUSTOMER_QUOTES,
    icon: RoutesIconsMap.get('QUOTES'),
    exact: true,
  },
  {
    label: 'Impostazioni',
    route: APP_PATHS.DASHBOARD.SETTINGS,
    icon: RoutesIconsMap.get('SETTINGS'),
    exact: true,
  },
];