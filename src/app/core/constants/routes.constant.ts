export const ROUTE_SEGMENTS = {
  ROOT: '',
  LANDING: 'landing',
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
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
