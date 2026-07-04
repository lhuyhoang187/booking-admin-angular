import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  let token = null;

  // Lấy token thông minh dựa trên URL hiện tại
  if (typeof window !== 'undefined') {
    const isAdminArea = window.location.pathname.startsWith('/admin');
    const userType = isAdminArea ? 'admin' : 'partner';
    token = authService.getToken(userType);
  }

  // Nếu có token, nhân bản request và nhét token vào Header Authorization
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  // Nếu chưa đăng nhập (hoặc đang gọi API Login/Register), cứ để request bay đi bình thường
  return next(req);
};