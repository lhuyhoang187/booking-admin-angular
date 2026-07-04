import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 

// Lùi 3 cấp để trỏ về thư mục services gốc
import { PartnerService } from '../../../services/partner.service';
import Swal from 'sweetalert2'; // Thêm import Swal

@Component({
  selector: 'app-partner-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-promotions.html',
  styleUrl: './partner-promotions.css'
})
export class PartnerPromotionsComponent implements OnInit, OnDestroy {
  itemList: any[] = [];
  isLoading = true;
  showModal = false;
  isEditMode = false;
  currentItem: any = this.getEmptyItem();
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastTimeout: any;
  private statusRefreshInterval: any; 

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

    this.loadData(); 
    this.statusRefreshInterval = setInterval(() => { this.cdr.detectChanges(); }, 1000);
  }

  ngOnDestroy() {
    if (this.statusRefreshInterval) clearInterval(this.statusRefreshInterval);
  }

  getEmptyItem() {
    return { code: '', discount_type: 1, discount_value: 0, max_discount_amount: null, min_booking_value: 0, start_date: '', end_date: '', usage_limit: null, status: 1 };
  }

  displayToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => { this.showToast = false; this.cdr.detectChanges(); }, 3000);
  }

  loadData() {
    this.isLoading = true;
    this.partnerService.getPromotions().subscribe({
      next: (res: any) => {
        this.itemList = res.promotions || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  getSmartStatus(item: any) {
    if (item.status == 0) return { label: 'Đã khóa', class: 'bg-secondary' };
    const now = new Date();
    const startDate = new Date(item.start_date.replace(' ', 'T'));
    const endDate = new Date(item.end_date.replace(' ', 'T'));
    if (item.usage_limit && item.used_count >= item.usage_limit) return { label: 'Hết lượt', class: 'bg-warning' };
    if (now < startDate) return { label: 'Sắp diễn ra', class: 'bg-info' };
    if (now > endDate) return { label: 'Đã hết hạn', class: 'bg-danger' };
    return { label: 'Đang diễn ra', class: 'bg-success' };
  }

  openModal(item?: any) {
    if (item) {
      this.isEditMode = true;
      this.currentItem = { ...item };
      if (this.currentItem.start_date) this.currentItem.start_date = this.currentItem.start_date.replace(' ', 'T').substring(0, 16);
      if (this.currentItem.end_date) this.currentItem.end_date = this.currentItem.end_date.replace(' ', 'T').substring(0, 16);
    } else {
      this.isEditMode = false;
      this.currentItem = this.getEmptyItem();
    }
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  saveItem() {
    const apiCall = this.isEditMode 
      ? this.partnerService.updatePromotion(this.currentItem.id, this.currentItem)
      : this.partnerService.addPromotion(this.currentItem);

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

  toggleStatus(item: any, newStatus: number) {
    const actionText = newStatus === 1 ? 'mở lại' : 'khóa';
    
    // Thay đổi: Dùng Swal để hỏi trước khi Khóa/Mở khóa
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn có chắc chắn muốn ${actionText} mã khuyến mãi này?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 1 ? '#3b82f6' : '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.partnerService.updatePromotion(item.id, { status: newStatus }).subscribe({
          next: () => {
            // Thay đổi: Dùng Swal báo thành công
            Swal.fire({ icon: 'success', title: 'Thành công!', text: `Đã ${actionText} thành công!`, showConfirmButton: false, timer: 1500 });
            this.loadData();
          },
          error: (err: any) => {
            // Thay đổi: Dùng Swal báo lỗi
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi thao tác.', confirmButtonText: 'Đóng' });
          }
        });
      }
    });
  }
}