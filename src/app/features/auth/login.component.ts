import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowRight,
  heroEye,
  heroEyeSlash,
  heroLockClosed,
  heroUser,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../core/services/auth.service';
import { FormValidationService } from '../../core/services/form-validation.service';
import { MainLogo } from '../../components/main-logo/main-logo';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIcon, MainLogo],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [
    provideIcons({
      heroUser,
      heroLockClosed,
      heroEye,
      heroEyeSlash,
      heroArrowRight,
    }),
  ],
})
export class LoginComponent {
  #fb = inject(FormBuilder);
  #authService = inject(AuthService);
  #router = inject(Router);
  #validationService = inject(FormValidationService);
  protected readonly googleBtn = viewChild<ElementRef<HTMLElement>>('googleBtn');

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly submitted = signal(false);

  readonly loginForm = this.#fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly usernameControl = this.loginForm.controls.username;
  readonly passwordControl = this.loginForm.controls.password;

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
      },
    }),
  );

  constructor() {
    afterNextRender(() => {
      const container = this.googleBtn()?.nativeElement;
      if (container) {
        this.#authService.renderGoogleButton(container, {
          onSuccess: () => {
            this.#router.navigate(['/']).catch(() => { });
          },
          onError: (error) => {
            console.error('Google Sign-in failed:', error);
          },
        });
      }
    });
  }

  togglePassword(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.loginForm.invalid) {
      this.#validationService.markFormGroupTouched(this.loginForm);
      return;
    }

    const { username, password } = this.loginForm.getRawValue();
    // HTTP authentication call will be integrated here
  }

  onRegister(): void {
    // Navigation or handler for manual registration
    this.#router.navigate(['/register']).catch(() => { });
  }
}
