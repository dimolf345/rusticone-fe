import { AuthProvider } from './auth.model';

export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  authProvider: 'local' | 'google' | AuthProvider;
  authProviderUserID?: string;
  emailVerified?: boolean;
  googleId?: string | null;
  lastLoginAt?: string;
  username?: string;
}