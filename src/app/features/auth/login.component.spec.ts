import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
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

  it('should validate form and show error signals when submitted empty', () => {
    component.onSubmit();

    expect(component.submitted()).toBe(true);
    expect(component.usernameError()).toBe('Il nome utente è obbligatorio');
    expect(component.passwordError()).toBe('La password è obbligatoria');
  });

  it('should validate form when fields are filled properly', () => {
    component.loginForm.setValue({
      username: 'mario.rossi',
      password: 'secretPassword123',
    });

    expect(component.loginForm.valid).toBe(true);
    expect(component.usernameError()).toBeNull();
    expect(component.passwordError()).toBeNull();
  });

  it('should have google button container in view', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const googleBtn = compiled.querySelector('.google-btn-container');
    expect(googleBtn).toBeTruthy();
  });

  it('should handle Register trigger', () => {
    const registerSpy = vi.spyOn(component, 'onRegister');
    component.onRegister();
    expect(registerSpy).toHaveBeenCalled();
  });
});
