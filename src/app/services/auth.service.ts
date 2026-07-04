import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// Định nghĩa một Type chuẩn để tránh gõ sai chính tả ở các hàm bên dưới
export type UserType = 'admin' | 'partner' | 'customer';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==========================================
  // XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ
  // ==========================================
  
  // Hàm Login gốc
  login(email: string, password: string, type: UserType = 'partner'): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password, type });
  }

  // Tái sử dụng hàm gốc cho Admin
  loginAdmin(data: any): Observable<any> {
    return this.login(data.email, data.password, 'admin'); 
  }

  // Tái sử dụng hàm gốc cho Customer
  loginCustomer(data: any): Observable<any> {
    return this.login(data.email, data.password, 'customer'); 
  }

  // Đăng ký Partner
  registerPartner(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/register`, data);
  }

  // ==========================================
  // LOGIC XỬ LÝ TOKEN TẬP TRUNG CHO 3 ĐỐI TƯỢNG
  // ==========================================

  // Lưu token với key động
  saveToken(token: string, userType: UserType = 'partner'): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const tokenKey = `${userType}_token`; // Tự động tạo: admin_token, partner_token, customer_token
      localStorage.setItem(tokenKey, token);
    }
  }

  // Lấy token theo đối tượng
  getToken(userType: UserType = 'partner'): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const tokenKey = `${userType}_token`;
      return localStorage.getItem(tokenKey);
    }
    return null;
  }

  // Xóa token tương ứng khi đăng xuất
  logout(userType: UserType = 'partner'): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const tokenKey = `${userType}_token`;
      localStorage.removeItem(tokenKey);
    }
  }
}