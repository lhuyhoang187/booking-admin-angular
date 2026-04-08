import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  // Lấy danh sách tất cả đơn đặt phòng
  getBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/bookings`, { headers: this.getHeaders() });
  }

  // Xem chi tiết 1 đơn
  getBookingDetail(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/bookings/${id}`, { headers: this.getHeaders() });
  }

  // Xác nhận đơn hàng (Đổi trạng thái thành Confirmed)
  confirmBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${id}/confirm`, {}, { headers: this.getHeaders() });
  }

  // Khách đến nhận phòng (Check-in)
  checkInBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${id}/check-in`, {}, { headers: this.getHeaders() });
  }

  // Hủy đơn hàng
  cancelBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${id}/cancel`, {}, { headers: this.getHeaders() });
  }
}