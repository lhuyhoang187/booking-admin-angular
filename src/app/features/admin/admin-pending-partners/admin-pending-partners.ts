import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Lùi 3 cấp để gọi về thư mục services gốc
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2'; // Thêm import Swal

@Component({
  selector: 'app-admin-pending-partners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pending-partners.html',
  styleUrl: './admin-pending-partners.css'
})
export class AdminPendingPartnersComponent implements OnInit {
  pendingList: any[] = [];
  isLoading = true;

  showRejectModal = false;
  selectedHotelId: number | null = null;
  rejectReason = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.adminService.getPendingPartners().subscribe({
      next: (res: any) => {
        this.pendingList = res.data || [];
        this.isLoading = false;

        // Ép giao diện Angular vẽ lại ngay lập tức
        this.cdr.detectChanges();
      },
      error: (err: any) => { 
        console.error("Lỗi lấy danh sách duyệt:", err);
        this.isLoading = false;

        // Tắt loading ngay cả khi có lỗi
        this.cdr.detectChanges();
      }
    });
  }

  approve(hotelId: number) {
    // Thay đổi: Dùng Swal thay cho confirm()
    Swal.fire({
      title: 'Phê duyệt đối tác?',
      text: 'Bạn có chắc chắn muốn PHÊ DUYỆT đối tác này mở bán phòng?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.approvePartner(hotelId).subscribe({
          next: (res: any) => {
            // Thay đổi: Dùng Swal báo thành công
            Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message || 'Đã phê duyệt thành công!', showConfirmButton: false, timer: 1500 });
            this.loadData();
          },
          error: (err: any) => {
            // Thay đổi: Dùng Swal báo lỗi
            Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi xử lý phê duyệt.', confirmButtonText: 'Đóng' });
          }
        });
      }
    });
  }

  openRejectModal(hotelId: number) {
    this.selectedHotelId = hotelId;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.selectedHotelId = null;
  }

  submitReject() {
    if (!this.selectedHotelId || !this.rejectReason.trim()) {
      // Thay đổi: Dùng Swal báo lỗi
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng nhập lý do!', confirmButtonText: 'Đóng' });
      return;
    }

    this.adminService.rejectPartner(this.selectedHotelId, this.rejectReason).subscribe({
      next: (res: any) => {
        // Thay đổi: Dùng Swal báo thành công
        Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message || 'Đã từ chối đơn đăng ký.', showConfirmButton: false, timer: 1500 });
        this.closeRejectModal();
        this.loadData();
      },
      error: (err: any) => {
        // Thay đổi: Dùng Swal báo lỗi
        Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi từ chối phê duyệt.', confirmButtonText: 'Đóng' });
      }
    });
  }
}