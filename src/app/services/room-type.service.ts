import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoomTypeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==========================================
  // CRUD LOẠI PHÒNG
  // ==========================================
  getRooms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/room-types`);
  }

  createRoom(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/room-types`, data);
  }

  updateRoom(id: number, data: any): Observable<any> {
    // Angular HttpClient tự động phân biệt data là FormData hay JSON
    return this.http.post(`${this.apiUrl}/partner/room-types/${id}`, data);
  }

  deleteRoom(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/partner/room-types/${id}`);
  }

  // ==========================================
  // XỬ LÝ ẢNH & TIỆN ÍCH LOẠI PHÒNG
  // ==========================================
  uploadMedia(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/room-types/${id}/media`, formData);
  }

  updateRoomAmenities(id: number, amenityIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/room-types/${id}/amenities`, { amenity_ids: amenityIds });
  }
}