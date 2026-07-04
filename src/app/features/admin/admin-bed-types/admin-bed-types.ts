import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2'; // Thêm import Swal

@Component({
  selector: 'app-admin-bed-types', 
  standalone: true,                
  imports: [CommonModule, FormsModule], 
  templateUrl: './admin-bed-types.html',
  styleUrl: './admin-bed-types.css' 
})
export class AdminBedTypesComponent implements OnInit { 
  bedTypes: any[] = [];
  loading = false;
  
  currentBed: any = { id: null, name: '', status: 1 };
  isEditMode = false;
  showModal = false;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef // 👉 Bắt buộc phải có để chống kẹt loading
  ) {}

  ngOnInit(): void {
    this.loadBeds();
  }

  loadBeds() {
    this.loading = true;
    this.adminService.getBedTypes().subscribe({
      next: (res: any) => {
        this.bedTypes = res.data;
        this.loading = false;
        this.cdr.detectChanges(); // 👉 Ép cập nhật giao diện
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
    this.currentBed = { id: null, name: '', status: 1 };
    this.showModal = true;
  }

  openEditModal(bed: any) {
    this.isEditMode = true;
    this.currentBed = { ...bed }; 
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveBed() {
    if (!this.currentBed.name.trim()) {
      // Thay đổi: Dùng Swal báo lỗi
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng nhập tên loại giường!', confirmButtonText: 'Đóng' });
      return;
    }

    if (this.isEditMode) {
      this.adminService.updateBedType(this.currentBed.id, this.currentBed).subscribe({
        next: () => {
          // Thay đổi: Dùng Swal báo thành công
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Cập nhật thành công', showConfirmButton: false, timer: 1500 });
          this.loadBeds();
          this.closeModal();
        },
        error: (err: any) => {
          // Thay đổi: Dùng Swal báo lỗi
          Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi cập nhật', confirmButtonText: 'Đóng' });
        }
      });
    } else {
      this.adminService.addBedType(this.currentBed).subscribe({
        next: () => {
          // Thay đổi: Dùng Swal báo thành công
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Thêm mới thành công', showConfirmButton: false, timer: 1500 });
          this.loadBeds();
          this.closeModal();
        },
        error: (err: any) => {
          // Thay đổi: Dùng Swal báo lỗi
          Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi thêm mới', confirmButtonText: 'Đóng' });
        }
      });
    }
  }

  deleteBed(id: number) {
    // Thay đổi: Dùng Swal thay cho confirm()
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Bạn có chắc chắn muốn xóa loại giường này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Vâng, xóa nó!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteBedType(id).subscribe({
          next: () => {
            // Thay đổi: Dùng Swal báo thành công
            Swal.fire({ icon: 'success', title: 'Đã xóa!', text: 'Xóa thành công', showConfirmButton: false, timer: 1500 });
            this.loadBeds();
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