import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  // Forgot password modal state
  showForgotPasswordModal = false;
  forgotPasswordEmail = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message || 'Login failed';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      });
    }
  }

  onForgotPassword() {
    this.forgotPasswordEmail = this.loginForm.get('email')?.value || '';
    this.showForgotPasswordModal = true;
  }

  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
    this.forgotPasswordEmail = '';
  }

  submitForgotPassword() {
    if (this.forgotPasswordEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.forgotPasswordEmail)) {
      this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
        next: (response) => {
          alert(response.message || 'Password reset email sent');
          this.closeForgotPasswordModal();
        },
        error: (error) => {
          alert(error.message || 'Failed to send password reset email');
        }
      });
    } else {
      alert('Please enter a valid email address');
    }
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
