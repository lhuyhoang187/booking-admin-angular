import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import Swal from 'sweetalert2'; // Thêm import Swal


// Lùi 3 cấp để trỏ về thư mục services gốc
import { HotelService } from '../../../services/hotel.service'; 

@Component({
  selector: 'app-partner-overview', // Đã cập nhật selector
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partner-overview.html',
  styleUrl: './partner-overview.css' // Angular 17+ dùng styleUrl
})
export class PartnerOverviewComponent implements OnInit { // Đã đổi tên class
  stats: any = {
    pending_orders: 0,
    total_room_types: 0,
    total_revenue: 0
  };

  constructor(
    private hotelService: HotelService,
    private router: Router ,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // =========================================
    // LỚP BẢO VỆ: KIỂM TRA QUYỀN TRƯỚC KHI TẢI TRANG
    // =========================================
    const userStr = localStorage.getItem('partner_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // Lễ tân (role_id = 3) không được vào trang này
      if (Number(user.role_id) === 3) {
        Swal.fire('Từ chối truy cập', 'Bạn là Lễ tân, không có quyền vào trang này!', 'error');
        this.router.navigate(['/dashboard/room-matrix']); // Đá văng ra trang sơ đồ phòng
        return; // Dừng lập tức, không chạy code tải dữ liệu bên dưới
      }
    }

    this.loadStats();
  }

  loadStats() {
    this.hotelService.getDashboardStats().subscribe({
      next: (res: any) => {
        this.stats = res;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => console.log('Lỗi tải thống kê:', err)
    });
  }
}