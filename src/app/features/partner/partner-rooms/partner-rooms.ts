import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ĐÃ SỬA: Lùi 3 cấp để trỏ về thư mục services gốc
import { PartnerService } from '../../../services/partner.service'; 
import { forkJoin } from 'rxjs'; 
import Swal from 'sweetalert2'; // Thêm import Swal

export interface RoomType {
  id: number;
  name: string;
  base_price: number;
}

export interface Room {
  id?: number;
  room_type_id: number;
  room_name: string;
  status: number;
  room_type?: RoomType;
}

@Component({
  selector: 'app-partner-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-rooms.html',
  styleUrl: './partner-rooms.css'
})
export class PartnerRoomsComponent implements OnInit {
  roomList: Room[] = [];
  roomTypes: RoomType[] = []; 
  isLoading = true;

  showModal = false;
  isEditMode = false;
  
  currentItem: Room = { room_type_id: 0, room_name: '', status: 1 };

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastTimeout: any;

  constructor(
    private partnerService: PartnerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
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

  loadInitialData() {
    this.isLoading = true;
    
    // 1. Tải danh mục Loại phòng độc lập 
    this.partnerService.getRoomTypes().subscribe({
      next: (res: any) => {
        this.roomTypes = res.room_types || [];
        this.cdr.detectChanges();
      }
    });

    // 2. Tải danh sách Sơ đồ phòng
    this.partnerService.getRooms().subscribe({
      next: (res: any) => {
        this.roomList = res.data || [];
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        // Thay đổi: Dùng Swal báo lỗi
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi khi tải dữ liệu từ máy chủ', confirmButtonText: 'Đóng' });
        console.error(err);
      }
    });
  }

  loadData() {
    this.partnerService.getRooms().subscribe({
      next: (res: any) => {
        this.roomList = res.data || [];
        this.cdr.detectChanges();
      }
    });
  }

  getRoomClass(status: number | string): string {
    const s = Number(status);
    if (s === 1) return 'room-empty';
    if (s === 2) return 'room-occupied';
    if (s === 0) return 'room-dirty';
    return 'room-maintenance';
  }

  openModal(item?: Room) {
    if (item) {
      this.isEditMode = true;
      this.currentItem = { ...item }; 
    } else {
      this.isEditMode = false;
      this.currentItem = { 
        room_type_id: this.roomTypes.length > 0 ? this.roomTypes[0].id : 0, 
        room_name: '', 
        status: 1 
      }; 
    }
    this.showModal = true;
  }

  closeModal() { 
    this.showModal = false; 
  }

  saveRoom() {
    if (this.currentItem.room_type_id == 0 || !this.currentItem.room_name.trim()) {
      // Thay đổi: Dùng Swal báo lỗi
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng chọn loại phòng và nhập số phòng đầy đủ!', confirmButtonText: 'Đóng' });
      return;
    }

    const apiCall = this.isEditMode && this.currentItem.id
      ? this.partnerService.updateRoom(this.currentItem.id, this.currentItem)
      : this.partnerService.addRoom(this.currentItem);

    apiCall.subscribe({
      next: (res: any) => {
        // Thay đổi: Dùng Swal báo thành công
        Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message || 'Đã lưu dữ liệu!', showConfirmButton: false, timer: 1500 });
        this.closeModal();
        this.loadData(); 
      },
      error: (err: any) => {
        // Thay đổi: Dùng Swal báo lỗi
        Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi hệ thống.', confirmButtonText: 'Đóng' });
      }
    });
  }

  changeRoomStatus(room: Room, newStatus: number | string) {
    if (!room.id) return;
    
    const oldStatus = room.status; 
    const statusNum = Number(newStatus);
    
    room.status = statusNum; 
    this.cdr.detectChanges(); 
    
    const updatedData = { status: statusNum };
    this.partnerService.updateRoom(room.id, updatedData).subscribe({
      next: () => {
        // Thay đổi: Dùng Swal báo thành công
        Swal.fire({ icon: 'success', title: 'Thành công!', text: `Đã chuyển phòng ${room.room_name} sang trạng thái mới!`, showConfirmButton: false, timer: 1500 });
      },
      error: (err: any) => {
        room.status = oldStatus; 
        this.cdr.detectChanges();
        // Thay đổi: Dùng Swal báo lỗi
        Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi thao tác, đã khôi phục trạng thái.', confirmButtonText: 'Đóng' });
      }
    });
  }

  deleteRoom(id: number | undefined) {
    if (!id) return;
    
    // Thay đổi: Dùng Swal thay cho confirm()
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Bạn có chắc chắn muốn xóa phòng vật lý này khỏi hệ thống?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Vâng, xóa nó!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.partnerService.deleteRoom(id).subscribe({
          next: (res: any) => {
            // Thay đổi: Dùng Swal báo thành công
            Swal.fire({ icon: 'success', title: 'Đã xóa!', text: res.message || 'Phòng đã được xóa.', showConfirmButton: false, timer: 1500 });
            this.loadData();
          },
          error: (err: any) => {
            // Thay đổi: Dùng Swal báo lỗi
            Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi thao tác.', confirmButtonText: 'Đóng' });
          }
        });
      }
    });
  }
}