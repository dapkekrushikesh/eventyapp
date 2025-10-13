import { Injectable } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function adminGuard(): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.getCurrentUser();
    if (user && user.role === 'admin') {
      return true;
    } else {
      return router.createUrlTree(['/dashboard']);
    }
  };
}
