import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export interface ValidationErrorMessageOptions {
  /**
   * Human-friendly name of the field (e.g. "Il nome utente", "La password", "Email").
   */
  fieldName?: string;
  /**
   * Custom message overrides keyed by error identifier (e.g. { required: 'La password è obbligatoria' }).
   * Values can be static strings or functions receiving error metadata.
   */
  customMessages?: Record<string, string | ((error: any) => string)>;
}

export interface ValidationControlErrorOptions extends ValidationErrorMessageOptions {
  /**
   * Whether the parent form has been submitted.
   */
  isSubmitted?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FormValidationService {
  /**
   * Extracts the first error message from an AbstractControl if any error exists.
   */
  getErrorMessage(
    control: AbstractControl | null,
    options?: ValidationErrorMessageOptions,
  ): string | null {
    if (!control || !control.errors) {
      return null;
    }

    const errors = control.errors;
    const errorKeys = Object.keys(errors);

    if (errorKeys.length === 0) {
      return null;
    }

    const firstKey = errorKeys[0];
    const errorValue = errors[firstKey];
    const fieldName = options?.fieldName;
    const customMessages = options?.customMessages;

    // Check custom overrides first
    if (customMessages && firstKey in customMessages) {
      const custom = customMessages[firstKey];
      return typeof custom === 'function' ? custom(errorValue) : custom;
    }

    return this.#formatDefaultErrorMessage(firstKey, errorValue, fieldName);
  }

  /**
   * Determines if the control error should be visible (e.g. when touched, dirty, or submitted)
   * and returns the localized error message.
   */
  getControlError(
    control: AbstractControl | null,
    options?: ValidationControlErrorOptions,
  ): string | null {
    if (!control) {
      return null;
    }

    const isSubmitted = options?.isSubmitted ?? false;
    const isTouchedOrDirty = control.touched || control.dirty;

    if (!isSubmitted && !isTouchedOrDirty) {
      return null;
    }

    return this.getErrorMessage(control, options);
  }

  /**
   * Returns whether a field is considered in an invalid state for UI highlighting.
   */
  isFieldInvalid(control: AbstractControl | null, isSubmitted = false): boolean {
    if (!control) {
      return false;
    }

    const isTouchedOrDirty = control.touched || control.dirty;
    return control.invalid && (isTouchedOrDirty || isSubmitted);
  }

  /**
   * Recursively marks all controls within a FormGroup or FormArray as touched and updates validity.
   */
  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched({ onlySelf: true });

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  /**
   * Custom validator: ensures the input string is not just whitespace.
   */
  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isWhitespace = (control.value || '').toString().trim().length === 0;
      return isWhitespace ? { whitespace: true } : null;
    };
  }

  /**
   * Custom control validator: verifies that a control's value matches another control in the parent FormGroup.
   * Note: Runs once parent FormGroup is initialized.
   */
  matchValidator(matchTo: string, reverse = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const matchingControl = control.parent.get(matchTo);
      if (!matchingControl) {
        return null;
      }

      if (reverse) {
        matchingControl.updateValueAndValidity();
        return null;
      }

      return matchingControl.value === control.value ? null : { mustMatch: true };
    };
  }

  /**
   * Custom FormGroup validator: verifies that two fields within the group match (e.g. password & confirmPassword).
   * Sets the 'mustMatch' error on the target matching control.
   */
  passwordMatchValidator(
    passwordKey = 'password',
    confirmPasswordKey = 'confirmPassword',
  ): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordKey);
      const confirmPassword = group.get(confirmPasswordKey);

      if (!password || !confirmPassword) {
        return null;
      }

      if (confirmPassword.errors && !confirmPassword.hasError('mustMatch')) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ ...confirmPassword.errors, mustMatch: true });
        return { mustMatch: true };
      }

      if (confirmPassword.hasError('mustMatch')) {
        const errors = { ...confirmPassword.errors };
        delete errors['mustMatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }

      return null;
    };
  }

  #formatDefaultErrorMessage(errorKey: string, errorValue: any, fieldName?: string): string {
    const name = fieldName ?? 'Il campo';

    switch (errorKey) {
      case 'required':
        return `${name} è obbligatorio`;

      case 'minlength': {
        const requiredLength = errorValue?.requiredLength;
        return `${name} deve avere almeno ${requiredLength} caratteri`;
      }

      case 'maxlength': {
        const requiredLength = errorValue?.requiredLength;
        return `${name} non può superare ${requiredLength} caratteri`;
      }

      case 'email':
        return 'Inserisci un indirizzo email valido';

      case 'pattern':
        return `${name} non rispetta il formato corretto`;

      case 'min':
        return `${name} deve essere maggiore o uguale a ${errorValue?.min}`;

      case 'max':
        return `${name} non può superare ${errorValue?.max}`;

      case 'whitespace':
        return `${name} non può contenere solo spazi vuoti`;

      case 'mustMatch':
      case 'passwordMismatch':
        return 'I valori non corrispondono';

      default:
        return `${name} contiene un valore non valido`;
    }
  }
}
