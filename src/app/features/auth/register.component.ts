import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowRight,
  heroEnvelope,
  heroEye,
  heroEyeSlash,
  heroLockClosed,
  heroUser,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../core/services/auth.service';
import { FormValidationService } from '../../core/services/form-validation.service';
import { MainLogo } from '../../components/main-logo/main-logo';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, NgIcon, MainLogo],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroUser,
      heroEnvelope,
      heroLockClosed,
      heroEye,
      heroEyeSlash,
      heroArrowRight,
    }),
  ],
})
export class RegisterComponent {
  #fb = inject(FormBuilder);
  #authService = inject(AuthService);
  #router = inject(Router);
  #validationService = inject(FormValidationService);

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly isLoading = signal(false);
  readonly submitted = signal(false);

  readonly registerForm = this.#fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [
        this.#validationService.passwordMatchValidator('password', 'confirmPassword'),
      ],
    },
  );

  readonly emailControl = this.registerForm.controls.email;
  readonly usernameControl = this.registerForm.controls.username;
  readonly passwordControl = this.registerForm.controls.password;
  readonly confirmPasswordControl = this.registerForm.controls.confirmPassword;

  readonly emailError = computed(() =>
    this.#validationService.getControlError(this.emailControl, {
      isSubmitted: this.submitted(),
      fieldName: "L'email",
      customMessages: {
        required: "L'email è obbligatoria",
        email: 'Inserisci un indirizzo email valido',
      },
    }),
  );

  readonly usernameError = computed(() =>
    this.#validationService.getControlError(this.usernameControl, {
      isSubmitted: this.submitted(),
      fieldName: 'Il nome utente',
    }),
  );

  readonly passwordError = computed(() =>
    this.#validationService.getControlError(this.passwordControl, {
      isSubmitted: this.submitted(),
      fieldName: 'La password',
      customMessages: {
        required: 'La password è obbligatoria',
        minlength: 'La password deve contenere almeno 6 caratteri',
      },
    }),
  );

  readonly confirmPasswordError = computed(() =>
    this.#validationService.getControlError(this.confirmPasswordControl, {
      isSubmitted: this.submitted(),
      fieldName: 'La conferma password',
      customMessages: {
        required: 'La conferma password è obbligatoria',
        mustMatch: 'Le password non coincidono',
      },
    }),
  );

  togglePassword(): void {
    this.showPassword.update((val) => !val);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((val) => !val);
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.registerForm.invalid) {
      this.#validationService.markFormGroupTouched(this.registerForm);
      return;
    }

    const { email, username, password, confirmPassword } = this.registerForm.getRawValue();
    const finalUsername = username.trim() || email.trim();

    const payload = {
      email: email.trim(),
      username: finalUsername,
      password,
      confirmPassword,
    };

    // When register method is implemented on AuthService:
    if ('register' in this.#authService && typeof (this.#authService as any).register === 'function') {
      (this.#authService as any).register(payload);
    }
  }

  onLogin(): void {
    this.#router.navigate(['/login']).catch(() => {});
  }
}
