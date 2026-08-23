import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('should toggle password visibility signal', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePassword();
    expect(component.showPassword()).toBe(true);
    component.togglePassword();
    expect(component.showPassword()).toBe(false);
  });

  it('should fill demo account credentials into form', () => {
    const adminDemo = component.demoAccounts[0];
    component.fillDemoAccount(adminDemo);

    expect(component.loginForm.value.username).toBe(adminDemo.username);
    expect(component.loginForm.value.password).toBe(adminDemo.password);
    expect(component.loginForm.valid).toBe(true);
  });

  it('should perform successful login with demo account', async () => {
    const adminDemo = component.demoAccounts[0];
    component.fillDemoAccount(adminDemo);

    await component.onSubmit();

    expect(component.successMessage()).toContain('Benvenuto');
    expect(component.errorMessage()).toBeNull();
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('should display error message on wrong credentials submission', async () => {
    component.loginForm.setValue({
      username: 'wrong.user',
      password: 'wrongpassword',
    });

    await component.onSubmit();

    expect(component.errorMessage()).toBeTruthy();
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('should show validation errors when submitted with empty fields', async () => {
    await component.onSubmit();

    expect(component.usernameError()).toBe('Il nome utente è obbligatorio');
    expect(component.passwordError()).toBe('La password è obbligatoria');
    expect(authService.isAuthenticated()).toBe(false);
  });
});
