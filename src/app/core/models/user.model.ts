export type UserRole = 'admin' | 'cliente';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
}
