/// <reference types="google.accounts" />
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constant';
import {
  IAuthResponse,
  ILoginRequest,
  IMeResponse,
  IRefreshTokenResponse,
  IRegisterRequest,
} from '../models/auth.model';
import { User } from '../models/user.model';

export interface RenderGoogleButtonOptions {
  onSuccess?: (user: IAuthResponse) => void;
  onError?: (err: unknown) => void;
  customOptions?: google.accounts.id.GsiButtonConfiguration;
}

@Service()
export class AuthService {
  #http = inject(HttpClient);
  #router = inject(Router);

  #httpOptions = {
    withCredentials: true,
  };

  #accessToken = signal<string | null>(null);
  #currentUser = signal<User | null>(null);
  #isLoading = signal<boolean>(false);
  #refreshPromise: Promise<boolean> | null = null;

  readonly currentUser = this.#currentUser.asReadonly();
  readonly accessToken = this.#accessToken.asReadonly();
  readonly isLoading = this.#isLoading.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  /**
   * Sets the current in-memory access token.
   */
  setAccessToken(token: string | null): void {
    this.#accessToken.set(token);
  }

  /**
   * Sets the current logged-in user.
   */
  setCurrentUser(user: User | null): void {
    this.#currentUser.set(user);
  }

  /**
   * Clears in-memory credentials and marks state as anonymous.
   */
  setAnonymous(): void {
    this.#accessToken.set(null);
    this.#currentUser.set(null);
  }

  /**
   * Performs user login with email and password.
   * Stores access token in memory and updates current user.
   */
  login(credentials: ILoginRequest): Observable<IAuthResponse> {
    const url = `${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`;
    return this.#http.post<IAuthResponse>(url, credentials, this.#httpOptions).pipe(
      tap((response) => {
        this.#accessToken.set(response.accessToken);
        this.#currentUser.set(response.user);
        this.redirectUserByRole(response.user).catch(() => {});
      }),
    );
  }

  /**
   * Fetches the profile of the currently logged user (/auth/me).
   */
  getMe(): Observable<IMeResponse> {
    const url = `${environment.apiUrl}${API_ENDPOINTS.AUTH.ME}`;
    const token = this.#accessToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.#http
      .get<IMeResponse>(url, {
        ...this.#httpOptions,
        headers,
      })
      .pipe(
        tap((response) => {
          this.#currentUser.set(response.user);
        }),
      );
  }

  /**
   * Rotates the refresh token and updates the in-memory access token.
   * Coalesces concurrent calls via a single shared promise.
   */
  refreshAccess(): Promise<boolean> {
    if (this.#refreshPromise) {
      return this.#refreshPromise;
    }

    const url = `${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`;
    this.#refreshPromise = firstValueFrom(
      this.#http.post<IRefreshTokenResponse>(url, {}, this.#httpOptions),
    )
      .then((response) => {
        if (response?.accessToken) {
          this.#accessToken.set(response.accessToken);
          return true;
        }
        this.setAnonymous();
        return false;
      })
      .catch(() => {
        this.setAnonymous();
        return false;
      })
      .finally(() => {
        this.#refreshPromise = null;
      });

    return this.#refreshPromise;
  }


  /**
   * Initializes authentication on application bootstrap.
   * Attempts to refresh session and load user info before rendering protected app.
   */
  async initializeAuth(): Promise<void> {
    this.#isLoading.set(true);
    try {
      const refreshed = await this.refreshAccess();
      if (!refreshed) {
        this.setAnonymous();
        return;
      }

      const meResponse = await firstValueFrom(this.getMe());
      if (meResponse?.user) {
        this.#currentUser.set(meResponse.user);
      } else {
        this.setAnonymous();
      }
    } catch {
      this.setAnonymous();
    } finally {
      this.#isLoading.set(false);
    }
  }

  /**
   * Registers a new user with email and password.
   */
  register(payload: IRegisterRequest): Observable<IAuthResponse> {
    const url = `${environment.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`;
    return this.#http.post<IAuthResponse>(url, payload, this.#httpOptions).pipe(
      tap((response) => {
        this.#accessToken.set(response.accessToken);
        this.#currentUser.set(response.user);
        this.redirectUserByRole(response.user).catch(() => {});
      }),
    );
  }

  /**
   * Logs out the user on the server, clears local state, and navigates to login.
   */
  async logout(): Promise<void> {
    const url = `${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`;
    try {
      await firstValueFrom(this.#http.post(url, {}, this.#httpOptions));
    } catch {
      // Logout server call is best-effort
    } finally {
      this.setAnonymous();
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.disableAutoSelect();
      }
      await this.#router.navigate(['/login']).catch(() => {});
    }
  }

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
            this.#accessToken.set(authResponse.accessToken);
            this.#currentUser.set(authResponse.user);
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
    return firstValueFrom(
      this.#http.post<IAuthResponse>(url, { idToken }, this.#httpOptions),
    );
  }


  /**
   * Redirects the user according to their role.
   */
  redirectUserByRole(user?: User | null): Promise<boolean> {
    const targetUser = user ?? this.currentUser();
    if (!targetUser) {
      return this.#router.navigate(['/login']);
    }

    if (targetUser.role === 'admin') {
      return this.#router.navigate(['/admin']);
    }

    return this.#router.navigate(['/customer']);
  }
}

