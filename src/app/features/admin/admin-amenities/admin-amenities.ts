import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Lùi 3 cấp để gọi về thư mục services gốc
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2'; // Thêm import Swal

@Component({
  selector: 'app-admin-amenities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-amenities.html',
  styleUrl: './admin-amenities.css'
})
export class AdminAmenitiesComponent implements OnInit {
  amenityList: any[] = [];
  isLoading = true;

  showModal = false;
  isEditMode = false;
  currentAmenity: any = { name: '', icon: '', type: 1 };

  // 👇 BIẾN DÙNG CHO TOAST NOTIFICATION 👇
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastTimeout: any;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  // 👇 HÀM HIỂN THỊ THÔNG BÁO TỰ TẮT 👇
  displayToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();

    // Reset bộ đếm giờ nếu người dùng bấm liên tục
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    // Tự động ẩn sau 3 giây
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  loadData() {
    this.isLoading = true;
    this.adminService.getAmenities().subscribe({
      next: (res: any) => {
        this.amenityList = res.data || [];
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

  openModal(item?: any) {
    if (item) {
      this.isEditMode = true;
      this.currentAmenity = { ...item }; // Copy dữ liệu để sửa
    } else {
      this.isEditMode = false;
      this.currentAmenity = { name: '', icon: '', type: 1 }; // Tạo mới
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveAmenity() {
    if (!this.currentAmenity.name.trim()) {
      // Thay đổi: Dùng Swal báo lỗi
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng nhập tên tiện ích!', confirmButtonText: 'Đóng' });
      return;
    }

    if (this.isEditMode) {
      // Gọi API Cập nhật
      this.adminService.updateAmenity(this.currentAmenity.id, this.currentAmenity).subscribe({
        next: (res: any) => {
          // Thay đổi: Dùng Swal báo thành công
          Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message || 'Cập nhật thành công!', showConfirmButton: false, timer: 1500 });
          this.closeModal();
          this.loadData();
        },
        error: (err: any) => {
          // Thay đổi: Dùng Swal báo lỗi
          Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi cập nhật.', confirmButtonText: 'Đóng' });
        }
      });
    } else {
      // Gọi API Thêm mới
      this.adminService.addAmenity(this.currentAmenity).subscribe({
        next: (res: any) => {
          // Thay đổi: Dùng Swal báo thành công
          Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message || 'Thêm mới thành công!', showConfirmButton: false, timer: 1500 });
          this.closeModal();
          this.loadData();
        },
        error: (err: any) => {
          // Thay đổi: Dùng Swal báo lỗi
          Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi thêm mới.', confirmButtonText: 'Đóng' });
        }
      });
    }
  }

  deleteAmenity(id: number) {
    // Thay đổi: Dùng Swal thay cho confirm()
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Bạn có chắc chắn muốn xóa tiện ích này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Vâng, xóa nó!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteAmenity(id).subscribe({
          next: (res: any) => {
            // Thay đổi: Dùng Swal báo thành công
            Swal.fire({ icon: 'success', title: 'Đã xóa!', text: res.message || 'Xóa tiện ích thành công!', showConfirmButton: false, timer: 1500 });
            this.loadData();
          },
          error: (err: any) => {
            // Thay đổi: Dùng Swal báo lỗi
            Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi xóa tiện ích.', confirmButtonText: 'Đóng' });
          }
        });
      }
    });
  }
}