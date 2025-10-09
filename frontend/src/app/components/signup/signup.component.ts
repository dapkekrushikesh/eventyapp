import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Custom Password Validators
export class PasswordValidators {
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;
      if (!value) return null;

      const errors: any = {};

      // Length validation (8-128 characters)
      if (value.length < 8) {
        errors.minLength = { requiredLength: 8, actualLength: value.length };
      }
      if (value.length > 128) {
        errors.maxLength = { requiredLength: 128, actualLength: value.length };
      }

      // Must contain at least one lowercase letter
      if (!/[a-z]/.test(value)) {
        errors.lowercase = true;
      }

      // Must contain at least one uppercase letter
      if (!/[A-Z]/.test(value)) {
        errors.uppercase = true;
      }

      // Must contain at least one digit
      if (!/\d/.test(value)) {
        errors.digit = true;
      }

      // Must contain at least one special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        errors.specialChar = true;
      }

      // No spaces allowed
      if (/\s/.test(value)) {
        errors.noSpaces = true;
      }

      // No more than 2 consecutive repeated characters
      if (/(.)\1{2,}/.test(value)) {
        errors.repeatedChars = true;
      }

      // Common weak passwords check
      const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
      if (commonPasswords.includes(value.toLowerCase())) {
        errors.commonPassword = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
  }
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BrowserAnimationsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPasswordRules = false;
  showPassword = false; // For hold-to-reveal password
  passwordFieldTouched = false; // For showing password rules on touch

  // Password requirements for display
  passwordRequirements = [
    { rule: 'At least 8 characters long', met: false },
    { rule: 'Maximum 128 characters', met: false },
    { rule: 'At least one lowercase letter (a-z)', met: false },
    { rule: 'At least one uppercase letter (A-Z)', met: false },
    { rule: 'At least one number (0-9)', met: false },
    { rule: 'At least one special character (!@#$%^&*)', met: false },
    { rule: 'No spaces allowed', met: false },
    { rule: 'No more than 2 consecutive repeated characters', met: false }
  ];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, PasswordValidators.strongPassword()]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Watch password changes to update requirements display
    this.signupForm.get('password')?.valueChanges.subscribe((password: string) => {
      this.updatePasswordRequirements(password);
    });
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.signupForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const userData = {
        name: this.signupForm.get('name')?.value,
        email: this.signupForm.get('email')?.value,
        password: this.signupForm.get('password')?.value
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastr.success('Signup successful! Please login.', 'Success');
            this.router.navigate(['/login']);
          } else {
            this.errorMessage = response.message || 'Registration failed';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Registration failed. Please try again.';
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  updatePasswordRequirements(password: string) {
    if (!password) {
      this.passwordRequirements.forEach(req => req.met = false);
      return;
    }

    this.passwordRequirements[0].met = password.length >= 8; // Min length
    this.passwordRequirements[1].met = password.length <= 128; // Max length
    this.passwordRequirements[2].met = /[a-z]/.test(password); // Lowercase
    this.passwordRequirements[3].met = /[A-Z]/.test(password); // Uppercase
    this.passwordRequirements[4].met = /\d/.test(password); // Number
    this.passwordRequirements[5].met = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password); // Special char
    this.passwordRequirements[6].met = !/\s/.test(password); // No spaces
    this.passwordRequirements[7].met = !/(.)\1{2,}/.test(password); // No repeated chars
  }

  togglePasswordRules() {
    this.showPasswordRules = !this.showPasswordRules;
  }

  getPasswordStrength(): string {
    const metRequirements = this.passwordRequirements.filter(req => req.met).length;
    if (metRequirements <= 2) return 'weak';
    if (metRequirements <= 5) return 'medium';
    if (metRequirements <= 7) return 'strong';
    return 'very-strong';
  }

  getPasswordErrors(): string[] {
    const passwordControl = this.signupForm.get('password');
    if (!passwordControl?.errors) return [];

    const errors: string[] = [];
    if (passwordControl.errors['minLength']) {
      errors.push('Password must be at least 8 characters long');
    }
    if (passwordControl.errors['maxLength']) {
      errors.push('Password cannot exceed 128 characters');
    }
    if (passwordControl.errors['lowercase']) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (passwordControl.errors['uppercase']) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (passwordControl.errors['digit']) {
      errors.push('Password must contain at least one number');
    }
    if (passwordControl.errors['specialChar']) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    if (passwordControl.errors['noSpaces']) {
      errors.push('Password cannot contain spaces');
    }
    if (passwordControl.errors['repeatedChars']) {
      errors.push('Password cannot have more than 2 consecutive repeated characters');
    }
    if (passwordControl.errors['commonPassword']) {
      errors.push('This password is too common. Please choose a different one');
    }
    return errors;
  }
}
