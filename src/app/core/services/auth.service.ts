import { computed, Injectable, signal } from '@angular/core';
import { DEMO_ACCOUNTS, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _currentUser = signal<User | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  async login(username: string, password: string): Promise<User> {
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Check demo accounts
    const matchedDemo = DEMO_ACCOUNTS.find(
      (account) =>
        account.username.toLowerCase() === trimmedUsername && account.password === trimmedPassword,
    );

    if (matchedDemo) {
      const user: User = {
        id: matchedDemo.role === 'admin' ? 'usr_admin_01' : 'usr_cliente_01',
        username: matchedDemo.username,
        name: matchedDemo.role === 'admin' ? 'Amministratore' : 'Mario Rossi',
        role: matchedDemo.role,
        email: matchedDemo.role === 'admin' ? 'admin@ilrusticone.it' : 'mario.rossi@example.com',
      };
      this._currentUser.set(user);
      return user;
    }

    throw new Error('Credenziali non valide. Riprova con un account di prova.');
  }

  logout(): void {
    this._currentUser.set(null);
  }
}
