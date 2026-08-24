/// <reference types="google.accounts" />
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, Service, effect } from '@angular/core';
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constant';
import { User } from '../models/user.model';
import { LOCAL_STORAGE_KEYS } from '../constants/local-storage.constants';

export interface RenderGoogleButtonOptions {
  onSuccess?: (user: User) => void;
  onError?: (err: unknown) => void;
  customOptions?: google.accounts.id.GsiButtonConfiguration;
}

@Service()
export class AuthService {
  #http = inject(HttpClient);
  #currentUser = signal<User | null>(null);

  readonly currentUser = this.#currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.#currentUser() !== null);
  readonly isAdmin = computed(() => this.#currentUser()?.role === 'admin');

  saveOrRemoveTokenEffect = effect(() => {
    const authenticatedUser = this.currentUser();

    if (authenticatedUser === null) {
      [LOCAL_STORAGE_KEYS.ACCESS_TOKEN, LOCAL_STORAGE_KEYS.REFRESH_TOKEN].forEach((k) => localStorage.removeItem(k));
    }

    const { accessToken, refreshToken } = authenticatedUser;
    if (accessToken) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }

    if (refreshToken) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  });

  /**
   * Initializes Google Identity Services and renders the official Google button inside the container.
   */
  renderGoogleButton(container: HTMLElement, options?: RenderGoogleButtonOptions): void {
    const initAndRender = () => {
      if (typeof google === 'undefined' || !google?.accounts?.id) {
        options?.onError?.(new Error('Google Identity Services SDK non caricato.'));
        return;
      }

      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: async (response: google.accounts.id.CredentialResponse) => {
          try {
            if (!response.credential) {
              throw new Error('Nessun token ID Google ricevuto');
            }

            const user = await this.#verifyGoogleTokenOnBackend(response.credential);
            this.setCurrentUser(user);
            options?.onSuccess?.(user);
          } catch (err) {
            options?.onError?.(err);
          }
        },
      });

      const buttonConfig: google.accounts.id.GsiButtonConfiguration = {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: Math.min(container.offsetWidth || 350, 400),
        logo_alignment: 'left',
        ...options?.customOptions,
      };

      google.accounts.id.renderButton(container, buttonConfig);
    };

    if (typeof google !== 'undefined' && google?.accounts?.id) {
      initAndRender();
    } else {
      // If script is still loading, wait briefly for SDK
      const checkInterval = setInterval(() => {
        if (typeof google !== 'undefined' && google?.accounts?.id) {
          clearInterval(checkInterval);
          initAndRender();
        }
      }, 100);

      setTimeout(() => clearInterval(checkInterval), 5000);
    }
  }

  /**
   * Sends the Google ID token to the backend for verification.
   */
  #verifyGoogleTokenOnBackend(idToken: string): Promise<User> {
    const url = `${environment.apiUrl}${API_ENDPOINTS.AUTH.SIGN_IN_WITH_GOOGLE}`;
    return firstValueFrom(this.#http.post<User>(url, { idToken }));
  }

  setCurrentUser(user: User | null): void {
    this.#currentUser.set(user);
  }

  logout(): void {
    this.#currentUser.set(null);
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
  }
}
