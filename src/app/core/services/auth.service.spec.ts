import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isAdmin()).toBe(false);
  });

  it('should update user and computed role signals with setCurrentUser', () => {
    const mockUser: User = {
      id: '123',
      username: 'admin.user',
      name: 'Admin',
      role: 'admin',
    };

    service.setCurrentUser(mockUser);
    expect(service.currentUser()).toEqual(mockUser);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);

    service.logout();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isAdmin()).toBe(false);
  });

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
