import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Import các thư viện cần thiết
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth-interceptor'; // Đảm bảo đường dẫn đúng

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Kết hợp cả fetch API và Interceptor vào đây
    provideHttpClient(
      withFetch(), 
      withInterceptors([authInterceptor])
    )
  ]
};