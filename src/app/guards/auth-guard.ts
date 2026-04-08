import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Kiểm tra xem trong Local Storage có Token không
  if (authService.getToken()) {
    return true; // Cho phép đi tiếp vào trang quản trị
  } else {
    // Nếu không có Token, đẩy về trang Login
    router.navigate(['/login']);
    return false;
  }
};