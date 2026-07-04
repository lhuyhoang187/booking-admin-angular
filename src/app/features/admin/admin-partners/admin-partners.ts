import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Lùi 3 cấp để gọi về thư mục services gốc
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2'; // Thêm import Swal

@Component({
  selector: 'app-admin-partners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-partners.html',
  styleUrl: './admin-partners.css'
})
export class AdminPartnersComponent implements OnInit {
  partnerList: any[] = [];
  isLoading = true;

  showSuspendModal = false;
  selectedHotelId: number | null = null;
  suspendReason = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.adminService.getApprovedPartners().subscribe({
      next: (res: any) => {
        this.partnerList = res.data || [];
        this.isLoading = false;
        
        // Ép giao diện vẽ lại ngay lập tức
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        
        // Có lỗi cũng ép vẽ lại để tắt chữ Loading
        this.cdr.detectChanges();
      }
    });
  }

  openSuspendModal(hotelId: number) {
    this.selectedHotelId = hotelId;
    this.suspendReason = '';
    this.showSuspendModal = true;
  }

  closeSuspendModal() {
    this.showSuspendModal = false;
    this.selectedHotelId = null;
  }

  submitSuspend() {
    if (!this.selectedHotelId || !this.suspendReason.trim()) {
      // Thay đổi: Dùng Swal báo lỗi
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng nhập lý do!', confirmButtonText: 'Đóng' });
      return;
    }

    this.adminService.suspendPartner(this.selectedHotelId, this.suspendReason).subscribe({
      next: (res: any) => {
        // Thay đổi: Dùng Swal báo thành công
        Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message || 'Đã khóa thành công.', showConfirmButton: false, timer: 1500 });
        this.closeSuspendModal();
        this.loadData(); // Tải lại danh sách
      },
      error: (err: any) => {
        // Thay đổi: Dùng Swal báo lỗi
        Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi xử lý.', confirmButtonText: 'Đóng' });
      }
    });
  }
}