import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly submitted = signal(false);

  readonly loginForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
  });

  readonly usernameControl = this.loginForm.controls.username;
  readonly passwordControl = this.loginForm.controls.password;

  readonly usernameError = computed(() => {
    if (!this.submitted() && !this.usernameControl.touched) return null;
    if (this.usernameControl.hasError('required')) return 'Il nome utente è obbligatorio';
    if (this.usernameControl.hasError('minlength'))
      return 'Il nome utente deve avere almeno 3 caratteri';
    return null;
  });

  readonly passwordError = computed(() => {
    if (!this.submitted() && !this.passwordControl.touched) return null;
    if (this.passwordControl.hasError('required')) return 'La password è obbligatoria';
    if (this.passwordControl.hasError('minlength'))
      return 'La password deve avere almeno 4 caratteri';
    return null;
  });

  togglePassword(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.getRawValue();
    // HTTP authentication call will be integrated here
  }

  onGoogleSignIn(): void {
    // OAuth 2.0 Google Sign-in will be integrated here
  }

  onRegister(): void {
    // Navigation or handler for manual registration
    this.router.navigate(['/register']).catch(() => {});
  }
}
