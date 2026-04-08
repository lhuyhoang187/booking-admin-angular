import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/hotel`, { headers: this.getHeaders() });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/hotel`, data, { headers: this.getHeaders() });
  }

  // THÊM MỚI: Hàm lấy dữ liệu thống kê cho trang Tổng quan
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/dashboard-stats`, { headers: this.getHeaders() });
  }
}