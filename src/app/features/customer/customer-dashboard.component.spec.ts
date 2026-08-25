import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CustomerDashboardComponent } from './customer-dashboard.component';
import { AuthService } from '../../core/services/auth.service';

describe('CustomerDashboardComponent', () => {
  let component: CustomerDashboardComponent;
  let fixture: ComponentFixture<CustomerDashboardComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDashboardComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create the customer dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should render buffet packages', () => {
    expect(component.buffetPackages().length).toBeGreaterThan(0);
  });

  it('should return correct badge metadata for quote status', () => {
    const badge = component.getStatusBadge('under_review');
    expect(badge.label).toBe('In elaborazione');
    expect(badge.class).toBe('badge-warning');
  });

  it('should call authService.logout when logout is invoked', () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    component.logout();
    expect(logoutSpy).toHaveBeenCalled();
  });
});
