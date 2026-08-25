/// <reference types="google.accounts" />
import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Service, signal } from '@angular/core';
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constant';
import { LOCAL_STORAGE_KEYS } from '../constants/local-storage.constants';
import { IAuthResponse } from '../models/auth.model';

export interface RenderGoogleButtonOptions {
  onSuccess?: (user: IAuthResponse) => void;
  onError?: (err: unknown) => void;
  customOptions?: google.accounts.id.GsiButtonConfiguration;
}

@Service()
export class AuthService {
  #http = inject(HttpClient);
  #authResponse = signal<IAuthResponse | null>(null);

  readonly currentUser = computed(() => this.#authResponse()?.user || null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  saveOrRemoveTokenEffect = effect(() => {
    const authResponse = this.#authResponse();

    if (authResponse === null) {
      [LOCAL_STORAGE_KEYS.ACCESS_TOKEN, LOCAL_STORAGE_KEYS.REFRESH_TOKEN].forEach((k) => localStorage.removeItem(k));
    }

    const { accessToken, refreshToken } = authResponse!;
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

            const authResponse = await this.#verifyGoogleTokenOnBackend(response.credential);
            this.#authResponse.set(authResponse);
            options?.onSuccess?.(authResponse);
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
  #verifyGoogleTokenOnBackend(idToken: string): Promise<IAuthResponse> {
    const url = `${environment.apiUrl}${API_ENDPOINTS.AUTH.SIGN_IN_WITH_GOOGLE}`;
    return firstValueFrom(this.#http.post<IAuthResponse>(url, { idToken }));
  }

  logout(): void {
    this.#authResponse.set(null);
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
  }
}
