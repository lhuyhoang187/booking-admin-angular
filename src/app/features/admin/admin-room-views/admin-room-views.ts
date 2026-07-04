import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2'; // Thêm import Swal

@Component({
  selector: 'app-admin-room-views', 
  standalone: true,                
  imports: [CommonModule, FormsModule], 
  templateUrl: './admin-room-views.html',
  styleUrl: './admin-room-views.css' 
})
export class AdminRoomViewsComponent implements OnInit { 
  roomViews: any[] = [];
  loading = false;
  
  currentView: any = { id: null, name: '', status: 1 };
  isEditMode = false;
  showModal = false;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.loadViews();
  }

  loadViews() {
    this.loading = true;
    this.adminService.getRoomViews().subscribe({
      next: (res: any) => {
        this.roomViews = res.data;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Lỗi tải danh sách', err);
        this.loading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentView = { id: null, name: '', status: 1 };
    this.showModal = true;
  }

  openEditModal(view: any) {
    this.isEditMode = true;
    this.currentView = { ...view }; 
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveView() {
    if (!this.currentView.name.trim()) {
      // Thay đổi: Dùng Swal báo lỗi
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng nhập tên hướng nhìn!', confirmButtonText: 'Đóng' });
      return;
    }

    if (this.isEditMode) {
      this.adminService.updateRoomView(this.currentView.id, this.currentView).subscribe({
        next: () => {
          // Thay đổi: Dùng Swal báo thành công
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Cập nhật thành công', showConfirmButton: false, timer: 1500 });
          this.loadViews();
          this.closeModal();
        },
        error: (err: any) => {
          // Thay đổi: Dùng Swal báo lỗi
          Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi cập nhật', confirmButtonText: 'Đóng' });
        }
      });
    } else {
      this.adminService.addRoomView(this.currentView).subscribe({
        next: () => {
          // Thay đổi: Dùng Swal báo thành công
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Thêm mới thành công', showConfirmButton: false, timer: 1500 });
          this.loadViews();
          this.closeModal();
        },
        error: (err: any) => {
          // Thay đổi: Dùng Swal báo lỗi
          Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi thêm mới', confirmButtonText: 'Đóng' });
        }
      });
    }
  }

  deleteView(id: number) {
    // Thay đổi: Dùng Swal thay cho confirm()
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Bạn có chắc chắn muốn xóa hướng nhìn này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Vâng, xóa nó!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteRoomView(id).subscribe({
          next: () => {
            // Thay đổi: Dùng Swal báo thành công
            Swal.fire({ icon: 'success', title: 'Đã xóa!', text: 'Xóa thành công', showConfirmButton: false, timer: 1500 });
            this.loadViews();
          },
          error: (err: any) => {
            // Thay đổi: Dùng Swal báo lỗi
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi khi xóa', confirmButtonText: 'Đóng' });
          }
        });
      }
    });
  }
}