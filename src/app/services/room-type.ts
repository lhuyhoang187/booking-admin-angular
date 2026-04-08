import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoomTypeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  getRooms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner/room-types`, { headers: this.getHeaders() });
  }

  createRoom(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/room-types`, data, { headers: this.getHeaders() });
  }

  updateRoom(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/partner/room-types/${id}`, data, { headers: this.getHeaders() });
  }

  deleteRoom(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/partner/room-types/${id}`, { headers: this.getHeaders() });
  }

  // Hàm tải file ảnh/video
  uploadMedia(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/partner/room-types/${id}/media`, formData, { 
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` }) 
    });
  }
}