import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// ĐÃ SỬA: Lùi 3 cấp để trỏ về thư mục services gốc
import { PartnerService } from '../../../services/partner.service';
import Swal from 'sweetalert2'; // Thêm import Swal

@Component({
  selector: 'app-partner-amenities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-amenities.html',
  styleUrl: './partner-amenities.css' // Dùng styleUrl cho Angular 17+
})
export class PartnerAmenitiesComponent implements OnInit {
  
  isLoading = true;
  allAmenities: any[] = [];
  selectedIds: number[] = [];

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastTimeout: any;

  constructor(
    private router: Router,
    private partnerService: PartnerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
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
    this.loadData();
  }

  displayToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  loadData() {
    this.isLoading = true;
    this.partnerService.getHotelAmenities().subscribe({
      next: (res: any) => {
        this.allAmenities = res.all_amenities || [];
        this.selectedIds = res.selected_ids || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Hàm xử lý khi Đối tác tích/bỏ tích Checkbox
  toggleAmenity(amenityId: number, event: any) {
    if (event.target.checked) {
      // Nếu tích vào -> Thêm ID vào mảng
      this.selectedIds.push(amenityId);
    } else {
      // Nếu bỏ tích -> Xóa ID khỏi mảng
      this.selectedIds = this.selectedIds.filter(id => id !== amenityId);
    }
  }

  saveAmenities() {
    this.partnerService.updateHotelAmenities(this.selectedIds).subscribe({
      next: (res: any) => {
        // Thay đổi: Dùng Swal báo thành công
        Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message || 'Lưu tiện ích thành công!', showConfirmButton: false, timer: 1500 });
      },
      error: (err: any) => {
        // Thay đổi: Dùng Swal báo lỗi
        Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi lưu tiện ích.', confirmButtonText: 'Đóng' });
      }
    });
  }
}