export type UserRole = 'admin' | 'cliente';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
}

export interface DemoAccount {
  role: UserRole;
  roleLabel: string;
  username: string;
  password: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'admin',
    roleLabel: 'Admin',
    username: 'admin',
    password: 'pizza2024',
  },
  {
    role: 'cliente',
    roleLabel: 'Cliente',
    username: 'mario.rossi',
    password: 'cliente123',
  },
];
