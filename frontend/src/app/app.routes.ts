import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'events',
    loadComponent: () => import('./components/events/events.component').then(m => m.EventsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'event-create',
    loadComponent: () => import('./components/events/events.component').then(m => m.EventsComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'profile-settings',
    loadComponent: () => import('./components/profile-settings/profile-settings.component').then(m => m.ProfileSettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
