import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormValidationService } from './form-validation.service';

describe('FormValidationService', () => {
  let service: FormValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getErrorMessage', () => {
    it('should return null when control is null or has no errors', () => {
      expect(service.getErrorMessage(null)).toBeNull();

      const validControl = new FormControl('valid value', Validators.required);
      expect(service.getErrorMessage(validControl)).toBeNull();
    });

    it('should return default required message with and without fieldName', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();

      expect(service.getErrorMessage(control)).toBe('Il campo è obbligatorio');
      expect(service.getErrorMessage(control, { fieldName: 'Il nome utente' })).toBe(
        'Il nome utente è obbligatorio',
      );
    });

    it('should return formatted minlength and maxlength error messages', () => {
      const minControl = new FormControl('ab', Validators.minLength(3));
      expect(service.getErrorMessage(minControl, { fieldName: 'Il nome utente' })).toBe(
        'Il nome utente deve avere almeno 3 caratteri',
      );

      const maxControl = new FormControl('123456', Validators.maxLength(5));
      expect(service.getErrorMessage(maxControl, { fieldName: 'Il codice' })).toBe(
        'Il codice non può superare 5 caratteri',
      );
    });

    it('should return email and pattern error messages', () => {
      const emailControl = new FormControl('invalid-email', Validators.email);
      expect(service.getErrorMessage(emailControl)).toBe('Inserisci un indirizzo email valido');

      const patternControl = new FormControl('abc', Validators.pattern(/^[0-9]+$/));
      expect(service.getErrorMessage(patternControl, { fieldName: 'Il numero' })).toBe(
        'Il numero non rispetta il formato corretto',
      );
    });

    it('should return min, max, whitespace and match error messages', () => {
      const minControl = new FormControl(2, Validators.min(5));
      expect(service.getErrorMessage(minControl, { fieldName: 'Il quantitativo' })).toBe(
        'Il quantitativo deve essere maggiore o uguale a 5',
      );

      const maxControl = new FormControl(12, Validators.max(10));
      expect(service.getErrorMessage(maxControl, { fieldName: 'Il quantitativo' })).toBe(
        'Il quantitativo non può superare 10',
      );

      const whitespaceControl = new FormControl('   ', service.noWhitespaceValidator());
      expect(service.getErrorMessage(whitespaceControl, { fieldName: 'Il testo' })).toBe(
        'Il testo non può contenere solo spazi vuoti',
      );

      const customMatchControl = new FormControl('abc');
      customMatchControl.setErrors({ mustMatch: true });
      expect(service.getErrorMessage(customMatchControl)).toBe('I valori non corrispondono');
    });

    it('should return fallback for unknown errors', () => {
      const control = new FormControl('');
      control.setErrors({ customUnknownError: true });
      expect(service.getErrorMessage(control, { fieldName: 'Il campo' })).toBe(
        'Il campo contiene un valore non valido',
      );
    });

    it('should support custom string and functional message overrides', () => {
      const control = new FormControl('', Validators.required);
      const customStringMessage = service.getErrorMessage(control, {
        customMessages: {
          required: 'La password è obbligatoria',
        },
      });
      expect(customStringMessage).toBe('La password è obbligatoria');

      const minControl = new FormControl('ab', Validators.minLength(5));
      const customFnMessage = service.getErrorMessage(minControl, {
        customMessages: {
          minlength: (err) => `Minimo ${err.requiredLength} caratteri richiesti`,
        },
      });
      expect(customFnMessage).toBe('Minimo 5 caratteri richiesti');
    });
  });

  describe('getControlError', () => {
    it('should return null if control is untouched, not dirty, and form not submitted', () => {
      const control = new FormControl('', Validators.required);
      expect(service.getControlError(control)).toBeNull();
      expect(service.getControlError(control, { isSubmitted: false })).toBeNull();
    });

    it('should return error if control is touched or dirty or form submitted', () => {
      const control = new FormControl('', Validators.required);

      control.markAsTouched();
      expect(service.getControlError(control, { fieldName: 'Il nome' })).toBe(
        'Il nome è obbligatorio',
      );

      const dirtyControl = new FormControl('', Validators.required);
      dirtyControl.markAsDirty();
      expect(service.getControlError(dirtyControl, { fieldName: 'Il nome' })).toBe(
        'Il nome è obbligatorio',
      );

      const submittedControl = new FormControl('', Validators.required);
      expect(
        service.getControlError(submittedControl, { isSubmitted: true, fieldName: 'Il nome' }),
      ).toBe('Il nome è obbligatorio');
    });
  });

  describe('isFieldInvalid', () => {
    it('should return false for valid controls or untouched invalid controls when not submitted', () => {
      const validControl = new FormControl('valid');
      expect(service.isFieldInvalid(validControl)).toBe(false);

      const invalidControl = new FormControl('', Validators.required);
      expect(service.isFieldInvalid(invalidControl, false)).toBe(false);
      expect(service.isFieldInvalid(null)).toBe(false);
    });

    it('should return true when control is invalid and touched, dirty, or submitted', () => {
      const invalidControl = new FormControl('', Validators.required);

      invalidControl.markAsTouched();
      expect(service.isFieldInvalid(invalidControl)).toBe(true);

      const dirtyControl = new FormControl('', Validators.required);
      dirtyControl.markAsDirty();
      expect(service.isFieldInvalid(dirtyControl)).toBe(true);

      const submittedControl = new FormControl('', Validators.required);
      expect(service.isFieldInvalid(submittedControl, true)).toBe(true);
    });
  });

  describe('markFormGroupTouched', () => {
    it('should recursively mark all controls in FormGroup and FormArray as touched', () => {
      const form = new FormGroup({
        name: new FormControl('', Validators.required),
        address: new FormGroup({
          street: new FormControl('', Validators.required),
        }),
        items: new FormArray([new FormControl('', Validators.required)]),
      });

      expect(form.get('name')?.touched).toBe(false);
      expect(form.get('address.street')?.touched).toBe(false);
      expect(form.get('items.0')?.touched).toBe(false);

      service.markFormGroupTouched(form);

      expect(form.get('name')?.touched).toBe(true);
      expect(form.get('address.street')?.touched).toBe(true);
      expect(form.get('items.0')?.touched).toBe(true);
    });
  });

  describe('custom validators', () => {
    it('noWhitespaceValidator should validate properly', () => {
      const validator = service.noWhitespaceValidator();

      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
      expect(validator(new FormControl('  valid  '))).toBeNull();
      expect(validator(new FormControl('   '))).toEqual({ whitespace: true });
    });

    it('matchValidator should validate matching controls within parent FormGroup', () => {
      const form = new FormGroup({
        password: new FormControl('secret123'),
        confirmPassword: new FormControl('different', [service.matchValidator('password')]),
      });

      form.get('confirmPassword')?.updateValueAndValidity();
      expect(form.get('confirmPassword')?.hasError('mustMatch')).toBe(true);

      form.get('confirmPassword')?.setValue('secret123');
      expect(form.get('confirmPassword')?.hasError('mustMatch')).toBe(false);
    });

    it('passwordMatchValidator should validate matching controls at FormGroup level', () => {
      const form = new FormGroup(
        {
          password: new FormControl('secret123'),
          confirmPassword: new FormControl('different'),
        },
        { validators: [service.passwordMatchValidator('password', 'confirmPassword')] },
      );

      form.updateValueAndValidity();
      expect(form.hasError('mustMatch')).toBe(true);
      expect(form.get('confirmPassword')?.hasError('mustMatch')).toBe(true);

      form.get('confirmPassword')?.setValue('secret123');
      expect(form.hasError('mustMatch')).toBe(false);
      expect(form.get('confirmPassword')?.hasError('mustMatch')).toBe(false);
    });
  });
});
