import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-partner-room-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './partner-room-matrix.html',
  styleUrls: ['./partner-room-matrix.css']
})
export class PartnerRoomMatrixComponent implements OnInit {
  headers: any[] = [];
  matrixGrid: any[] = [];
  isLoading = true;

  startDate: string = '';
  endDate: string = '';

  constructor(
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    // Mặc định hiển thị dải lịch 15 ngày từ hôm nay đổ đi cho thoáng tầm nhìn
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    const targetEnd = new Date();
    targetEnd.setDate(today.getDate() + 14);
    this.endDate = targetEnd.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadMatrix();
  }

  loadMatrix() {
    this.isLoading = true;
    this.bookingService.getRoomMatrixGrid(this.startDate, this.endDate).subscribe({
      next: (res: any) => {
        this.headers = res.headers;
        this.matrixGrid = res.matrix;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Lỗi', 'Không thể tải sơ đồ lưới điều phối phòng!', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  shiftDays(days: number) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    start.setDate(start.getDate() + days);
    end.setDate(end.getDate() + days);
    this.startDate = start.toISOString().split('T')[0];
    this.endDate = end.toISOString().split('T')[0];
    this.loadMatrix();
  }

  goToToday() {
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    const targetEnd = new Date();
    targetEnd.setDate(today.getDate() + 14);
    this.endDate = targetEnd.toISOString().split('T')[0];
    this.loadMatrix();
  }

  // Nhấp vào ô có khách để chuyển hướng bay thẳng tới trang Chi tiết đơn hàng xử lý
  viewBookingDetail(bookingId: number) {
    if (bookingId) {
      this.router.navigate(['/dashboard/bookings', bookingId]);
    }
  }

  getRoomStatusLabel(status: number): string {
    switch (status) {
      case 0: return '🧹 Cần dọn';
      case 1: return '🟢 Trống';
      case 2: return '🛌 Có khách';
      case 3: return '🛠️ Bảo trì';
      default: return '---';
    }
  }
}