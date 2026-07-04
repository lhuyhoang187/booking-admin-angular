import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminService } from '../../../services/admin.service'; // Chỉnh lại đường dẫn cho đúng

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-promotions.html',
  styleUrls: ['./admin-promotions.css']
})
export class AdminPromotionsComponent implements OnInit {
  itemList: any[] = [];
  isLoading = true;
  showModal = false;
  isEditMode = false;
  currentItem: any = this.getEmptyItem();

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadData(); }

  getEmptyItem() {
    return { code: '', discount_type: 1, discount_value: 0, max_discount_amount: null, min_booking_value: 0, start_date: '', end_date: '', usage_limit: null, status: 1 };
  }

  loadData() {
    this.isLoading = true;
    this.adminService.getGlobalPromotions().subscribe({
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
      ? this.adminService.updateGlobalPromotion(this.currentItem.id, this.currentItem)
      : this.adminService.addGlobalPromotion(this.currentItem);

    apiCall.subscribe({
      next: (res: any) => {
        Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message, showConfirmButton: false, timer: 1500 });
        this.closeModal();
        this.loadData();
      },
      error: (err: any) => {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi hệ thống.' });
      }
    });
  }

  toggleStatus(item: any, newStatus: number) {
    const actionText = newStatus === 1 ? 'mở lại' : 'khóa';
    Swal.fire({
      title: 'Xác nhận', text: `Bạn có muốn ${actionText} mã này?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Đồng ý'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.updateGlobalPromotion(item.id, { status: newStatus }).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Thành công!', showConfirmButton: false, timer: 1000 });
            this.loadData();
          }
        });
      }
    });
  }
}