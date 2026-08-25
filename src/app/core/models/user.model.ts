import { AuthProvider } from "./auth.model";

export type UserRole = 'admin' | 'customer';

export interface User {
  authProvider: AuthProvider;
  authProviderUserID: string;
  email?: string;
  emailVerified: boolean;
  googleId?: string | null;
  id: string;
  lastLoginAt: string;
  name: string;
  role: UserRole;
  username: string;
}