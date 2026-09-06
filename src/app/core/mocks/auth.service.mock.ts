import { computed, signal, WritableSignal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { vi } from 'vitest';
import {
  IAuthResponse,
  ILoginRequest,
  IMeResponse,
  IRefreshTokenResponse,
  IRegisterRequest,
} from '../models/auth.model';
import { IUser } from '../models/user.model';
import { IRenderGoogleButtonOptions } from '../services/auth.service';

export const mockUser: IUser = {
  id: 'user-123',
  email: 'mario.rossi@example.com',
  name: 'Mario Rossi',
  username: 'mario.rossi',
  role: 'customer',
  authProvider: 'local',
};

export const mockAdminUser: IUser = {
  id: 'admin-456',
  email: 'admin@rusticone.it',
  name: 'Admin Rusticone',
  username: 'admin',
  role: 'admin',
  authProvider: 'local',
};

export const mockAuthResponse: IAuthResponse = {
  accessToken: 'mock-access-token-xyz',
  user: mockUser,
};

export const mockAdminAuthResponse: IAuthResponse = {
  accessToken: 'mock-admin-access-token-xyz',
  user: mockAdminUser,
};

export const mockRefreshTokenResponse: IRefreshTokenResponse = {
  accessToken: 'mock-new-access-token-xyz',
};

export class MockAuthService {
  #accessToken: WritableSignal<string | null> = signal<string | null>(null);
  #currentUser: WritableSignal<IUser | null> = signal<IUser | null>(null);
  #isLoading: WritableSignal<boolean> = signal<boolean>(false);

  readonly currentUser = this.#currentUser.asReadonly();
  readonly accessToken = this.#accessToken.asReadonly();
  readonly isLoading = this.#isLoading.asReadonly();
  readonly isAuthenticated = computed(() => this.#currentUser() !== null);
  readonly isAdmin = computed(() => this.#currentUser()?.role === 'admin');

  setAccessToken = vi.fn((token: string | null): void => {
    this.#accessToken.set(token);
  });

  setCurrentUser = vi.fn((user: IUser | null): void => {
    this.#currentUser.set(user);
  });

  setAnonymous = vi.fn((): void => {
    this.#accessToken.set(null);
    this.#currentUser.set(null);
  });

  login = vi.fn((_credentials: ILoginRequest): Observable<IAuthResponse> => {
    this.#accessToken.set(mockAuthResponse.accessToken);
    this.#currentUser.set(mockAuthResponse.user);
    return of(mockAuthResponse);
  });

  getMe = vi.fn((): Observable<IMeResponse> => {
    const user = this.#currentUser() ?? mockUser;
    return of({ user });
  });

  refreshAccess = vi.fn(async (): Promise<boolean> => {
    this.#accessToken.set(mockRefreshTokenResponse.accessToken);
    return true;
  });

  initializeAuth = vi.fn(async (): Promise<void> => {
    this.#accessToken.set(mockAuthResponse.accessToken);
    this.#currentUser.set(mockAuthResponse.user);
  });

  register = vi.fn((payload: IRegisterRequest): Observable<IAuthResponse> => {
    const newUser: IUser = {
      ...mockUser,
      email: payload.email,
      name: payload.name,
      username: payload.username || payload.email,
    };
    const response: IAuthResponse = {
      accessToken: 'mock-registered-token',
      user: newUser,
    };
    this.#accessToken.set(response.accessToken);
    this.#currentUser.set(newUser);
    return of(response);
  });

  logout = vi.fn(async (): Promise<void> => {
    this.setAnonymous();
  });

  renderGoogleButton = vi.fn((_container: HTMLElement, _options?: IRenderGoogleButtonOptions): void => {});

  goToDashBoard = vi.fn(async (): Promise<boolean> => true);

  redirectUserByRole = vi.fn(async (_user?: IUser | null): Promise<boolean> => true);
}

export function createMockAuthService(initialUser: IUser | null = null): MockAuthService {
  const service = new MockAuthService();
  if (initialUser) {
    service.setCurrentUser(initialUser);
  }
  return service;
}

export const mockAuthService = createMockAuthService();
