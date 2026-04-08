import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/login`, { email, password });
  }

  registerPartner(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/register`, data);
  }

  saveToken(token: string) {
    // Kiểm tra xem có đang ở môi trường trình duyệt không
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('partner_token', token);
    }
  }

  getToken() {
    // Kiểm tra xem có đang ở môi trường trình duyệt không
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('partner_token');
    }
    return null;
  }

  logout() {
    // Kiểm tra xem có đang ở môi trường trình duyệt không
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('partner_token');
    }
  }
}