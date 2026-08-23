import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DEMO_ACCOUNTS, DemoAccount } from '../../core/models/user.model';
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

  readonly demoAccounts = DEMO_ACCOUNTS;

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
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

  fillDemoAccount(account: DemoAccount): void {
    this.loginForm.setValue({
      username: account.username,
      password: account.password,
    });
    this.errorMessage.set(null);
    this.successMessage.set(`Credenziali ${account.roleLabel} caricate!`);
    setTimeout(() => {
      if (this.successMessage()?.includes('caricate')) {
        this.successMessage.set(null);
      }
    }, 2500);
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.getRawValue();

    this.isLoading.set(true);

    try {
      const user = await this.authService.login(username, password);
      this.successMessage.set(`Benvenuto, ${user.name}!`);
      // Future navigation once dashboard / buffet routes are implemented
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore durante il login. Riprova.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
