import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constant';
import { IAuthResponse, IMeResponse, IRefreshTokenResponse } from '../../models/auth.model';
import { User } from '../../models/user.model';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockUser: User = {
    id: 'user-123',
    email: 'mario.rossi@example.com',
    name: 'Mario Rossi',
    role: 'customer',
    authProvider: 'local',
  };

  const mockAdminUser: User = {
    id: 'admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    authProvider: 'local',
  };

  const mockAuthResponse: IAuthResponse = {
    accessToken: 'jwt-access-token-123',
    user: mockUser,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with initial anonymous state', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeNull();
    expect(service.accessToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(service.isLoading()).toBe(false);
  });



  describe('login', () => {
    it('should send POST request to /auth/login with credentials and update memory state', () => {
      let result: IAuthResponse | undefined;

      service.login({ email: 'mario.rossi@example.com', password: 'password123' }).subscribe((res) => {
        result = res;
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.body).toEqual({
        email: 'mario.rossi@example.com',
        password: 'password123',
      });

      req.flush(mockAuthResponse);

      expect(result).toEqual(mockAuthResponse);
      expect(service.accessToken()).toBe('jwt-access-token-123');
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.isAdmin()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/customer']);
    });

    it('should redirect admin to /admin on login', () => {
      service.login({ email: 'admin@example.com', password: 'password123' }).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`);
      req.flush({ accessToken: 'jwt-admin-token', user: mockAdminUser });

      expect(service.isAdmin()).toBe(true);
      expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });
  });

  describe('getMe', () => {
    it('should send GET request to /auth/me with Authorization Bearer header and update currentUser', () => {
      service.setAccessToken('my-test-token');

      let meResult: IMeResponse | undefined;
      service.getMe().subscribe((res) => {
        meResult = res;
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.ME}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer my-test-token');
      expect(req.request.withCredentials).toBe(true);

      req.flush({ user: mockUser });

      expect(meResult).toEqual({ user: mockUser });
      expect(service.currentUser()).toEqual(mockUser);
    });
  });

  describe('refreshAccess', () => {
    it('should send POST request to /auth/refresh and store new accessToken in memory', async () => {
      const refreshPromise = service.refreshAccess();

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);

      const mockRefreshResponse: IRefreshTokenResponse = {
        accessToken: 'new-rotated-jwt-access-token',
      };
      req.flush(mockRefreshResponse);

      const success = await refreshPromise;
      expect(success).toBe(true);
      expect(service.accessToken()).toBe('new-rotated-jwt-access-token');
    });

    it('should coalesce concurrent calls into a single HTTP request', async () => {
      const call1 = service.refreshAccess();
      const call2 = service.refreshAccess();

      const requests = httpMock.match(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`);
      expect(requests.length).toBe(1);

      requests[0].flush({ accessToken: 'single-coalesced-token' });

      const [res1, res2] = await Promise.all([call1, call2]);
      expect(res1).toBe(true);
      expect(res2).toBe(true);
      expect(service.accessToken()).toBe('single-coalesced-token');
    });

    it('should handle refresh failure by clearing state and returning false', async () => {
      service.setAccessToken('existing-token');
      service.setCurrentUser(mockUser);

      const refreshPromise = service.refreshAccess();

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      const success = await refreshPromise;
      expect(success).toBe(false);
      expect(service.accessToken()).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('initializeAuth', () => {
    it('should refresh access and fetch me on successful startup', async () => {
      const initPromise = service.initializeAuth();

      const refreshReq = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`);
      refreshReq.flush({ accessToken: 'initial-access-token' });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const meReq = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.ME}`);
      expect(meReq.request.headers.get('Authorization')).toBe('Bearer initial-access-token');
      meReq.flush({ user: mockUser });

      await initPromise;

      expect(service.accessToken()).toBe('initial-access-token');
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.isLoading()).toBe(false);
    });


    it('should set anonymous if refresh fails', async () => {
      const initPromise = service.initializeAuth();

      const refreshReq = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`);
      refreshReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      await initPromise;

      expect(service.accessToken()).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should send POST to /auth/logout, clear in-memory state, and navigate to login', async () => {
      service.setAccessToken('test-token');
      service.setCurrentUser(mockUser);

      const logoutPromise = service.logout();

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      req.flush(null, { status: 204, statusText: 'No Content' });

      await logoutPromise;

      expect(service.accessToken()).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Google button integration', () => {
    it('should initialize and render Google button when google SDK is available', () => {
      const mockInitialize = vi.fn();
      const mockRenderButton = vi.fn();

      (globalThis as any).google = {
        accounts: {
          id: {
            initialize: mockInitialize,
            renderButton: mockRenderButton,
          },
        },
      };

      const container = document.createElement('div');
      service.renderGoogleButton(container);

      expect(mockInitialize).toHaveBeenCalled();
      expect(mockRenderButton).toHaveBeenCalledWith(container, expect.any(Object));
    });
  });
});

