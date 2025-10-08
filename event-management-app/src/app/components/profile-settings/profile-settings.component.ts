import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  displayName: string = 'New User';
  profileImageUrl: string = 'images/profile-img.png';
  tempDisplayName: string = '';
  tempProfileImageUrl: string = '';
  currentUser: User | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.displayName = user.displayName || user.name || 'New User';
        this.profileImageUrl = user.profileImageUrl || 'images/profile-img.png';
        this.tempDisplayName = this.displayName;
        this.tempProfileImageUrl = this.profileImageUrl;
      }
    });
  }

  onProfileImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.tempProfileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfileSettings() {
    if (!this.currentUser || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    const profileData = {
      displayName: this.tempDisplayName.trim() || this.currentUser.name,
      profileImageUrl: this.tempProfileImageUrl.trim() || this.profileImageUrl
    };

    this.authService.updateProfile(profileData).subscribe({
      next: (updatedUser: User) => {
        this.isLoading = false;
        this.displayName = updatedUser.displayName || updatedUser.name || 'New User';
        this.profileImageUrl = updatedUser.profileImageUrl || 'images/profile-img.png';
        // Navigate back to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to update profile';
      }
    });
  }

  cancel() {
    // Reset temporary values and navigate back
    this.tempDisplayName = this.displayName;
    this.tempProfileImageUrl = this.profileImageUrl;
    this.router.navigate(['/dashboard']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
