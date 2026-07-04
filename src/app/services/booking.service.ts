import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==========================================
  // QUẢN LÝ ĐƠN HÀNG (BOOKINGS)
  // ==========================================
  getBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/bookings`);
  }

  getBookingDetail(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/bookings/${id}`);
  }

  confirmBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${id}/confirm`, {});
  }

  checkInBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${id}/check-in`, {});
  }

  checkOutBooking(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${id}/check-out`, data);
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${id}/cancel`, {});
  }

  // ==========================================
  // XỬ LÝ GÁN PHÒNG & THÔNG TIN KHÁCH (CHECK-IN)
  // ==========================================
  getAvailableRooms(bookingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/bookings/${bookingId}/available-rooms`);
  }

  submitCheckIn(bookingId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/bookings/${bookingId}/check-in`, data);
  }
// Cập nhật danh sách khách lưu trú
  updateGuests(bookingId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${bookingId}/guests`, data);
  }

// Đổi phòng vật lý (Room Move)
  changeRoom(bookingId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${bookingId}/change-room`, data);
  }

  // Cập nhật Liên hệ & Ghi chú
  updateBookingNotes(bookingId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${bookingId}/notes`, data);
  }


  updateEstimatedTime(bookingId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${bookingId}/estimated-time`, data);
  }

  markAsNoShow(bookingId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${bookingId}/no-show`, {});
  }

  
// ==========================================
  // XỬ LÝ GỌI DỊCH VỤ & MINIBAR (TAB 2)
  // ==========================================
  getMenuAndCart(bookingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/bookings/${bookingId}/menu`);
  }

  addService(bookingId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/bookings/${bookingId}/add-service`, data);
  }

  addMinibar(bookingId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/bookings/${bookingId}/add-minibar`, data);
  }

  removeExtraService(bookingId: number, cartId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/partner/bookings/${bookingId}/remove-service/${cartId}`);
  }

 // Cập nhật số lượng hoặc ghi chú của món trong giỏ hàng
  updateExtraService(bookingId: number, cartId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/bookings/${bookingId}/update-service/${cartId}`, data);
  }

// ==========================================
  // XỬ LÝ PHỤ THU (SURCHARGE - TAB 3)
  // ==========================================
  addSurcharge(bookingId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/bookings/${bookingId}/add-surcharge`, data);
  }

  removeSurcharge(bookingId: number, surchargeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/partner/bookings/${bookingId}/remove-surcharge/${surchargeId}`);
  }
// ==========================================
  // XỬ LÝ ĐỀN BÙ VẬT TƯ (TAB 3)
  // ==========================================
  addDamagedItem(bookingId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/bookings/${bookingId}/add-damaged-item`, data);
  }

  removeDamagedItem(bookingId: number, itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/partner/bookings/${bookingId}/remove-damaged-item/${itemId}`);
  }


  getRoomMatrixGrid(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/room-matrix-grid?start_date=${startDate}&end_date=${endDate}`);
  }
}