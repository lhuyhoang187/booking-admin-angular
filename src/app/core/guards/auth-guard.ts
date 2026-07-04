import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Dùng startsWith để bắt chính xác route bắt đầu bằng /admin
  const isAdminRoute = state.url.startsWith('/admin');
  const userType = isAdminRoute ? 'admin' : 'partner';

  // 2. Lấy đúng loại token
  const token = authService.getToken(userType);

  if (token) {
    return true; // Có thẻ hợp lệ -> Cho đi tiếp
  }

  // 3. Không có thẻ -> Trả về UrlTree để Angular tự động chuyển hướng mượt mà
  const loginUrl = isAdminRoute ? '/admin/login' : '/login';
  return router.createUrlTree([loginUrl]);
};