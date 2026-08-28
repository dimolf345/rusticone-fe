import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create the register component', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.registerForm.valid).toBe(false);
  });

  it('should toggle password and confirm password visibility signals', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePassword();
    expect(component.showPassword()).toBe(true);
    component.togglePassword();
    expect(component.showPassword()).toBe(false);

    expect(component.showConfirmPassword()).toBe(false);
    component.toggleConfirmPassword();
    expect(component.showConfirmPassword()).toBe(true);
    component.toggleConfirmPassword();
    expect(component.showConfirmPassword()).toBe(false);
  });

  it('should validate form and show error signals when submitted empty', () => {
    component.onSubmit();

    expect(component.submitted()).toBe(true);
    expect(component.emailError()).toBe("L'email è obbligatoria");
    expect(component.nameError()).toBe('Il nome è obbligatorio');
    expect(component.passwordError()).toBe('La password è obbligatoria');
    expect(component.confirmPasswordError()).toBe('La conferma password è obbligatoria');
  });

  it('should validate password mismatch', () => {
    component.registerForm.patchValue({
      email: 'test@example.com',
      name: 'Mario Rossi',
      password: 'password123',
      confirmPassword: 'differentPassword',
    });

    component.onSubmit();

    expect(component.confirmPasswordError()).toBe('Le password non coincidono');
    expect(component.registerForm.valid).toBe(false);
  });

  it('should be valid when all required fields match and are valid', () => {
    component.registerForm.patchValue({
      email: 'test@example.com',
      name: 'Mario Rossi',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(component.registerForm.valid).toBe(true);
    expect(component.emailError()).toBeNull();
    expect(component.nameError()).toBeNull();
    expect(component.passwordError()).toBeNull();
    expect(component.confirmPasswordError()).toBeNull();
  });

  it('should fallback username to email if left empty upon submission', () => {
    vi.spyOn(authService, 'register').mockReturnValue(of({} as any));

    component.registerForm.patchValue({
      email: 'mario.rossi@example.com',
      name: 'Mario Rossi',
      username: '',
      password: 'secretPassword123',
      confirmPassword: 'secretPassword123',
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Mario Rossi',
      email: 'mario.rossi@example.com',
      username: 'mario.rossi@example.com',
      password: 'secretPassword123',
      confirmPassword: 'secretPassword123',
    });
  });

  it('should use explicit username if provided upon submission', () => {
    vi.spyOn(authService, 'register').mockReturnValue(of({} as any));

    component.registerForm.patchValue({
      email: 'mario.rossi@example.com',
      name: 'Mario Rossi',
      username: 'mariorossi99',
      password: 'secretPassword123',
      confirmPassword: 'secretPassword123',
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Mario Rossi',
      email: 'mario.rossi@example.com',
      username: 'mariorossi99',
      password: 'secretPassword123',
      confirmPassword: 'secretPassword123',
    });
  });

  it('should navigate to login when onLogin is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as never);
    component.onLogin();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
