import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../services/partner.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-partner-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-inventory.html',
  styleUrls: ['./partner-inventory.css']
})
export class PartnerInventoryComponent implements OnInit {
  headers: any[] = [];
  gridData: any[] = [];
  isLoading = true;

  // Dải ngày hiển thị (mặc định 14 ngày tính từ hôm nay)
  startDate: string = '';
  endDate: string = '';

  // Biến phục vụ cho Modal Cập nhật nhanh số lượng lớn
  showBulkModal = false;

  // 👉 ĐÃ FIX: Khai báo lại kiểu dữ liệu (Type) chuẩn xác cho bulkForm nâng cao
  bulkForm = {
    room_type_ids: [] as number[],
    start_date: '',
    end_date: '',
    update_type: 'fixed' as 'fixed' | 'percent' | 'reset', // Chỉ định rõ cụ thể các giá trị hợp lệ
    price_value: 0,
    change_status: false,
    is_closed: false
  };

  constructor(
    private partnerService: PartnerService,
    private cdr: ChangeDetectorRef
  ) {
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    const targetEnd = new Date();
    targetEnd.setDate(today.getDate() + 13); // Hiển thị dải ngày 2 tuần
    this.endDate = targetEnd.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory() {
    this.isLoading = true;
    this.partnerService.getRoomInventory(this.startDate, this.endDate).subscribe({
      next: (res: any) => {
        this.headers = res.headers;
        this.gridData = res.grid;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Lỗi', 'Không thể tải dữ liệu lịch phòng', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Điều hướng nhanh dải ngày (Lùi/Tiến tuần)
  shiftDays(days: number) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    start.setDate(start.getDate() + days);
    end.setDate(end.getDate() + days);
    this.startDate = start.toISOString().split('T')[0];
    this.endDate = end.toISOString().split('T')[0];
    this.loadInventory();
  }

  goToToday() {
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    const targetEnd = new Date();
    targetEnd.setDate(today.getDate() + 13);
    this.endDate = targetEnd.toISOString().split('T')[0];
    this.loadInventory();
  }

  openBulkModal() {
    // 👉 ĐÃ ĐỒNG BỘ: Thuộc tính gán khớp hoàn toàn 100% với cấu trúc khai báo
    this.bulkForm = {
      room_type_ids: this.gridData.map(r => r.room_type_id), // Mặc định chọn tất cả hạng phòng hiện có
      start_date: this.startDate,
      end_date: this.endDate,
      update_type: 'fixed', // Chế độ mặc định ban đầu
      price_value: 0,
      change_status: false,
      is_closed: false
    };
    this.showBulkModal = true;
  }

  toggleRoomTypeSelection(id: number) {
    if (this.bulkForm.room_type_ids.includes(id)) {
      this.bulkForm.room_type_ids = this.bulkForm.room_type_ids.filter(x => x !== id);
    } else {
      this.bulkForm.room_type_ids.push(id);
    }
  }

  saveBulkUpdate() {
    if (this.bulkForm.room_type_ids.length === 0) {
      Swal.fire('Cảnh báo', 'Vui lòng chọn ít nhất một loại phòng', 'warning');
      return;
    }

    const payload: any = {
      room_type_ids: this.bulkForm.room_type_ids,
      start_date: this.bulkForm.start_date,
      end_date: this.bulkForm.end_date,
      update_type: this.bulkForm.update_type,
      change_status: this.bulkForm.change_status,
      is_closed: this.bulkForm.is_closed
    };

    // Chỉ gửi giá trị lên nếu không thuộc chế độ reset
    if (this.bulkForm.update_type !== 'reset') {
      payload.price_value = this.bulkForm.price_value;
    }

    Swal.fire({ title: 'Đang lưu cấu hình lịch...', didOpen: () => Swal.showLoading() });
    
    this.partnerService.updateBulkInventory(payload).subscribe({
      next: () => {
        Swal.fire('Thành công', 'Cấu hình lịch phòng được lưu thành công!', 'success');
        this.showBulkModal = false;
        this.loadInventory();
      },
      error: (err) => Swal.fire('Thất bại', err.error?.message || 'Có lỗi xảy ra', 'error')
    });
  }

  // Thay đổi trạng thái đóng mở nhanh bằng cách nhấp thẳng vào nút mở/khóa trên lưới lịch
  quickToggleClose(roomTypeId: number, dateStr: string, currentStatus: number) {
    const payload = {
      room_type_ids: [roomTypeId],
      start_date: dateStr,
      end_date: dateStr,
      update_type: 'fixed', // Giữ nguyên mức giá hiện tại khi khóa/mở nhanh
      change_status: true,
      is_closed: currentStatus === 1 ? false : true
    };

    this.partnerService.updateBulkInventory(payload).subscribe({
      next: () => this.loadInventory(),
      error: (err) => Swal.fire('Lỗi', err.error?.message || 'Thao tác thất bại', 'error')
    });
  }

  formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
} 