import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService } from '../../core/services/auth.service';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create the admin dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should display recent orders in table', () => {
    expect(component.recentOrders().length).toBeGreaterThan(0);
  });

  it('should format status badge classes correctly', () => {
    expect(component.getStatusBadgeClass('confirmed')).toBe('badge-success');
    expect(component.getStatusBadgeClass('pending')).toBe('badge-warning');
  });

  it('should call authService.logout when logout is invoked', () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    component.logout();
    expect(logoutSpy).toHaveBeenCalled();
  });
});
