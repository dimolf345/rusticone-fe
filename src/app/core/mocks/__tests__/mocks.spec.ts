import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it, vi } from 'vitest';
import { IAlertItem } from '../../models/alert.model';
import { IAuthResponse, IMeResponse } from '../../models/auth.model';
import {
  createMockAlertService,
  createMockAuthErrorHandlerService,
  createMockAuthService,
  createMockFormValidationService,
  createMockLayoutService,
  mockAdminAuthResponse,
  mockAdminUser,
  mockAlertItem,
  mockAlertService,
  mockAuthErrorHandlerService,
  mockAuthResponse,
  mockAuthService,
  MockErrorAction,
  MockErrorHandler,
  mockFormValidationService,
  mockLayoutService,
  mockRefreshTokenResponse,
  mockUser,
} from '@mocks';

describe('Core Service Mocks', () => {
  describe('MockAlertService', () => {
    it('should show, update alerts signal, and remove alerts', () => {
      const mockAlert = createMockAlertService();
      expect(mockAlert.alerts()).toEqual([]);

      const alertId = mockAlert.show({ message: 'Hello', type: 'info' });
      expect(mockAlert.alerts().length).toBe(1);
      expect(mockAlert.alerts()[0].id).toBe(alertId);

      mockAlert.removeAlert(alertId);
      expect(mockAlert.alerts().length).toBe(0);
    });

    it('should support info, success, warning, and error helpers', () => {
      const mockAlert = createMockAlertService();
      mockAlert.info('Info test');
      mockAlert.success('Success test');
      mockAlert.warning('Warning test');
      mockAlert.error('Error test');

      expect(mockAlert.alerts().length).toBe(4);
      mockAlert.clear();
      expect(mockAlert.alerts().length).toBe(0);
    });

    it('should support setAlerts directly for test fixtures', () => {
      const mockAlert = createMockAlertService();
      mockAlert.setAlerts([mockAlertItem]);
      expect(mockAlert.alerts()).toEqual([mockAlertItem]);
      expect(mockAlertService).toBeDefined();
    });
  });

  describe('MockAuthService', () => {
    it('should initialize with anonymous state and support user setting', () => {
      const mockAuth = createMockAuthService();
      expect(mockAuth.currentUser()).toBeNull();
      expect(mockAuth.isAuthenticated()).toBe(false);
      expect(mockAuth.isAdmin()).toBe(false);

      mockAuth.setCurrentUser(mockUser);
      expect(mockAuth.currentUser()).toEqual(mockUser);
      expect(mockAuth.isAuthenticated()).toBe(true);
      expect(mockAuth.isAdmin()).toBe(false);

      mockAuth.setCurrentUser(mockAdminUser);
      expect(mockAuth.isAdmin()).toBe(true);

      mockAuth.setAnonymous();
      expect(mockAuth.currentUser()).toBeNull();
      expect(mockAuth.isAuthenticated()).toBe(false);
    });

    it('should mock login, register, and getMe observables', () => {
      const mockAuth = createMockAuthService();
      let loggedInUser: IAuthResponse | undefined;
      mockAuth.login({ email: 'test@test.com', password: 'password' }).subscribe((res) => {
        loggedInUser = res;
      });
      expect(loggedInUser).toEqual(mockAuthResponse);
      expect(mockAuth.currentUser()).toEqual(mockUser);

      let registeredUser: IAuthResponse | undefined;
      mockAuth
        .register({
          name: 'Jane Doe',
          email: 'jane@test.com',
          password: 'pw',
          confirmPassword: 'pw',
        })
        .subscribe((res) => {
          registeredUser = res;
        });
      expect(registeredUser?.user.email).toBe('jane@test.com');

      let meResponse: IMeResponse | undefined;
      mockAuth.getMe().subscribe((res) => {
        meResponse = res;
      });
      expect(meResponse?.user.email).toBe('jane@test.com');
      expect(mockAdminAuthResponse.user.role).toBe('admin');
      expect(mockAuthService).toBeDefined();
    });

    it('should mock refreshAccess, initializeAuth, logout, and navigation methods', async () => {
      const mockAuth = createMockAuthService(mockUser);
      await mockAuth.refreshAccess();
      expect(mockAuth.accessToken()).toBe(mockRefreshTokenResponse.accessToken);

      await mockAuth.logout();
      expect(mockAuth.currentUser()).toBeNull();

      expect(await mockAuth.goToDashBoard()).toBe(true);
      expect(await mockAuth.redirectUserByRole(mockAdminUser)).toBe(true);
    });
  });

  describe('MockAuthErrorHandlerService', () => {
    it('should mock addCustomHandler, setDefaultHandler, and handle callback', () => {
      const mockErrorHandler = createMockAuthErrorHandlerService();
      const mockAction = new MockErrorAction<Partial<IAlertItem>>();
      mockErrorHandler.addCustomHandler(mockAction);
      mockErrorHandler.setDefaultHandler(mockAction);

      expect(mockErrorHandler.customErrorHandlers().length).toBe(1);
      expect(mockErrorHandler.defaultErrorHandler()).toBe(mockAction);

      const callback = vi.fn();
      const error = new HttpErrorResponse({ status: HttpStatusCode.Unauthorized });
      mockErrorHandler.handle(error, undefined, callback);
      expect(callback).toHaveBeenCalledWith(error);
      expect(mockAuthErrorHandlerService).toBeDefined();
      expect(new MockErrorHandler()).toBeDefined();
    });
  });

  describe('MockFormValidationService', () => {
    it('should evaluate isFieldInvalid and markFormGroupTouched', () => {
      const mockValidation = createMockFormValidationService();
      const form = new FormGroup({
        field: new FormControl(''),
      });

      expect(mockValidation.isFieldInvalid(form.get('field'))).toBe(false);
      mockValidation.markFormGroupTouched(form);
      expect(form.get('field')?.touched).toBe(true);
      expect(mockFormValidationService).toBeDefined();
    });

    it('should provide custom validator factories', () => {
      const mockValidation = createMockFormValidationService();
      const noWhitespace = mockValidation.noWhitespaceValidator();
      expect(noWhitespace(new FormControl('   '))).toEqual({ whitespace: true });
      expect(noWhitespace(new FormControl('valid'))).toBeNull();
    });
  });

  describe('MockLayoutService', () => {
    it('should manage screen size signals and toggles', () => {
      const mockLayout = createMockLayoutService('desktop');
      expect(mockLayout.isDesktop()).toBe(true);
      expect(mockLayout.isMobile()).toBe(false);

      mockLayout.setScreenSize('mobile');
      expect(mockLayout.isMobile()).toBe(true);
      expect(mockLayout.isDesktop()).toBe(false);

      expect(mockLayout.isSidebarCollapsed()).toBe(false);
      mockLayout.toggleSidebar();
      expect(mockLayout.isSidebarCollapsed()).toBe(true);
      mockLayout.expandSidebar();
      expect(mockLayout.isSidebarCollapsed()).toBe(false);

      expect(mockLayout.isMobileDrawerOpen()).toBe(false);
      mockLayout.openMobileDrawer();
      expect(mockLayout.isMobileDrawerOpen()).toBe(true);
      mockLayout.closeMobileDrawer();
      expect(mockLayout.isMobileDrawerOpen()).toBe(false);
      expect(mockLayoutService).toBeDefined();
    });
  });
});
