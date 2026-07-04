import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
// Lùi 3 cấp để trỏ về thư mục services gốc
import { PartnerService } from '../../../services/partner.service'; 
import Swal from 'sweetalert2'; // Thêm import Swal

@Component({
  selector: 'app-partner-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-services.html',
  styleUrl: './partner-services.css' // Angular 17+ dùng styleUrl
})
export class PartnerServicesComponent implements OnInit {
  serviceList: any[] = [];
  isLoading = true;

  showModal = false;
  isEditMode = false;
  currentService: any = { name: '', description: '', price: 0, unit: 'Lượt', icon: '', status: 1 };

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

    this.loadData(); }

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
    this.partnerService.getServices().subscribe({
      next: (res: any) => {
        this.serviceList = res.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { 
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      }
    });
  }

  openModal(item?: any) {
    if (item) {
      this.isEditMode = true;
      this.currentService = { ...item }; 
      if (!this.currentService.unit) this.currentService.unit = 'Lượt';
    } else {
      this.isEditMode = false;
      this.currentService = { name: '', description: '', price: 0, unit: 'Lượt', icon: '', status: 1 }; 
    }
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  saveService() {
    if (!this.currentService.name.trim() || this.currentService.price < 0) {
      // Thay đổi: Dùng Swal báo lỗi
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng nhập tên và giá dịch vụ hợp lệ!', confirmButtonText: 'Đóng' });
      return;
    }

    const apiCall = this.isEditMode 
      ? this.partnerService.updateService(this.currentService.id, this.currentService)
      : this.partnerService.addService(this.currentService);

    apiCall.subscribe({
      next: (res: any) => {
        // Thay đổi: Dùng Swal báo thành công
        Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message || 'Đã lưu dữ liệu!', showConfirmButton: false, timer: 1500 });
        this.closeModal();
        this.loadData();
      },
      error: (err: any) => {
        // Thay đổi: Dùng Swal báo lỗi hệ thống
        Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi hệ thống.', confirmButtonText: 'Đóng' });
      }
    });
  }

  toggleServiceStatus(item: any, newStatus: number) {
    const actionText = newStatus === 1 ? 'mở lại' : 'ngừng cung cấp';
    
    // Thay đổi: Dùng Swal thay cho confirm()
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn có chắc chắn muốn ${actionText} dịch vụ này?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 1 ? '#3b82f6' : '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedItem = { ...item, status: newStatus };
        this.partnerService.updateService(item.id, updatedItem).subscribe({
          next: () => {
            // Thay đổi: Dùng Swal báo thành công
            Swal.fire({ icon: 'success', title: 'Thành công!', text: `Đã ${actionText} dịch vụ thành công!`, showConfirmButton: false, timer: 1500 });
            this.loadData();
          },
          error: () => {
            // Thay đổi: Dùng Swal báo lỗi
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi thao tác.', confirmButtonText: 'Đóng' });
          }
        });
      }
    });
  }
}