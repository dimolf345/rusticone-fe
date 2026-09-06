import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { vi } from 'vitest';
import {
  IValidationControlErrorOptions,
  IValidationErrorMessageOptions,
} from '../services/form-validation.service';

export class MockFormValidationService {
  getErrorMessage = vi.fn(
    (_control: AbstractControl | null, _options?: IValidationErrorMessageOptions): string | null =>
      null,
  );

  getControlError = vi.fn(
    (_control: AbstractControl | null, _options?: IValidationControlErrorOptions): string | null =>
      null,
  );

  isFieldInvalid = vi.fn((control: AbstractControl | null, isSubmitted = false): boolean => {
    if (!control) return false;
    const isTouchedOrDirty = control.touched || control.dirty;
    return control.invalid && (isTouchedOrDirty || isSubmitted);
  });

  markFormGroupTouched = vi.fn((formGroup: FormGroup | FormArray): void => {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched({ onlySelf: true });
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
    formGroup.updateValueAndValidity();
  });

  noWhitespaceValidator = vi.fn((): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const isWhitespace = (control.value || '').toString().trim().length === 0;
      return isWhitespace ? { whitespace: true } : null;
    };
  });

  matchValidator = vi.fn((_matchTo: string, _reverse = false): ValidatorFn => {
    return (_control: AbstractControl): ValidationErrors | null => null;
  });

  passwordMatchValidator = vi.fn(
    (_passwordKey = 'password', _confirmPasswordKey = 'confirmPassword'): ValidatorFn => {
      return (_group: AbstractControl): ValidationErrors | null => null;
    },
  );
}

export function createMockFormValidationService(): MockFormValidationService {
  return new MockFormValidationService();
}

export const mockFormValidationService = createMockFormValidationService();
