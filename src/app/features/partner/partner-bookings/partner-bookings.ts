import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BookingService } from '../../../services/booking.service';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-partner-bookings', 
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './partner-bookings.html',
  styleUrl: './partner-bookings.css'
})
export class PartnerBookingsComponent implements OnInit { 
  allBookings: any[] = []; 
  bookings: any[] = [];    
  
  searchTerm: string = '';
  statusFilter: string = ''; // '' = Tất cả, '0' = Chờ XN, '1' = Đã XN, '2' = Đang ở, '3' = Đã đi, '4' = Hủy/NoShow

  constructor(
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    Swal.fire({ title: 'Đang tải...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    this.bookingService.getBookings().subscribe({
      next: (res: any) => {
        this.allBookings = res.bookings || res.data || [];
        this.applyFilters(); // Áp dụng bộ lọc ngay lập tức
        Swal.close();
      },
      error: (err: any) => {
        console.log(err);
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải danh sách đơn hàng!' });
      }
    });
  }

  // Chuyển Tab (Thay vì dùng Select Dropdown như cũ)
  setStatusFilter(status: string) {
    this.statusFilter = status;
    this.applyFilters();
  }

  applyFilters() {
    this.bookings = this.allBookings.filter(bk => {
      // 1. Lọc theo trạng thái Tab
      let matchStatus = false;
      if (this.statusFilter === '') {
        matchStatus = true;
      } else if (this.statusFilter === '4') {
        // Gộp Hủy (4) và No-show (5) vào chung 1 tab
        matchStatus = (bk.status === 4 || bk.status === 5);
      } else {
        matchStatus = bk.status.toString() === this.statusFilter;
      }
      
      // 2. Lọc theo từ khóa tìm kiếm
      const term = this.searchTerm.toLowerCase().trim();
      const matchSearch = term === '' || 
                          (bk.booking_code && bk.booking_code.toLowerCase().includes(term)) ||
                          (bk.guest_name && bk.guest_name.toLowerCase().includes(term)) ||
                          (bk.guest_phone && bk.guest_phone.includes(term));

      return matchStatus && matchSearch;
    });
    
    this.cdr.detectChanges();
  }

  // Hàm hỗ trợ hiển thị số phòng vật lý ra giao diện bảng
  getAssignedRooms(booking: any): string {
    if (booking.status === 0 || booking.status === 4 || booking.status === 5) {
      return '-';
    }
    if (booking.room_assignments && booking.room_assignments.length > 0) {
      return booking.room_assignments.map((ra: any) => 'P.' + (ra.room?.room_name || ra.room?.name)).join(', ');
    }
    return 'Chưa gán';
  }

  // Hàm lấy text hiển thị trạng thái
  getStatusText(status: number): string {
    switch(status) {
      case 0: return 'Chờ xác nhận';
      case 1: return 'Đã xác nhận';
      case 2: return 'Đang lưu trú';
      case 3: return 'Đã trả phòng';
      case 4: return 'Đã hủy';
      case 5: return 'No-show';
      default: return 'Không xác định';
    }
  }
}