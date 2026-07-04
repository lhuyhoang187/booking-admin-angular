import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../services/partner.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-partner-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-staff.html',
  styleUrls: ['./partner-staff.css']
})
export class PartnerStaffComponent implements OnInit {
  staffs: any[] = [];
  roles: any[] = []; // 👉 STATE MỚI: Chứa danh sách nhóm quyền
  isLoading = true;
  
  showModal = false;
  isEditMode = false;
  
  formData = {
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    role_id: null as number | null, // 👉 Chuyển thành null thay vì số 3
    is_active: 1
  };

  constructor(
    private router: Router,
    private partnerService: PartnerService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('partner_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // Giờ ta chỉ chặn nếu không phải Chủ KS (role_id != 1)
      if (Number(user.role_id) !== 1) {
        Swal.fire('Từ chối truy cập', 'Chỉ Chủ khách sạn mới có quyền vào trang này!', 'error');
        this.router.navigate(['/dashboard/room-matrix']); 
        return; 
      }
    }

    this.loadRoles(); // Tải danh sách nhóm quyền trước
    this.loadStaffs();
  }

  // 👉 HÀM MỚI: Tải danh sách các Role
  loadRoles() {
    this.partnerService.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Lỗi tải role", err)
    });
  }

  loadStaffs() {
    this.partnerService.getStaffs().subscribe({
      next: (res: any) => {
        this.staffs = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        Swal.fire('Lỗi', 'Không có quyền truy cập hoặc lỗi tải dữ liệu', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal() {
    this.isEditMode = false;
    // Gán role_id mặc định là role đầu tiên trong danh sách (nếu có)
    const defaultRoleId = this.roles.length > 0 ? this.roles[0].id : null;
    
    this.formData = { id: null, first_name: '', last_name: '', email: '', password: '', phone: '', role_id: defaultRoleId, is_active: 1 };
    this.showModal = true;
    this.cdr.detectChanges(); 
  }

  openEditModal(staff: any) {
    this.isEditMode = true;
    this.formData = { 
      id: staff.id, 
      first_name: staff.first_name, 
      last_name: staff.last_name, 
      email: staff.email, 
      password: '', 
      phone: staff.phone, 
      role_id: staff.role_id, 
      is_active: staff.is_active 
    };
    this.showModal = true;
    this.cdr.detectChanges(); 
  }

  closeModal() {
    this.showModal = false;
    this.cdr.detectChanges(); 
  }

  saveStaff() {
    if (!this.formData.first_name || !this.formData.last_name || !this.formData.role_id || (!this.isEditMode && !this.formData.password)) {
      Swal.fire('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc (kể cả Nhóm quyền)', 'warning');
      return;
    }

    const request = this.isEditMode 
      ? this.partnerService.updateStaff(this.formData.id!, this.formData)
      : this.partnerService.createStaff(this.formData);

    request.subscribe({
      next: (res: any) => {
        Swal.fire('Thành công', res.message, 'success');
        this.closeModal();
        this.loadStaffs(); 
      },
      error: (err) => Swal.fire('Lỗi', err.error?.message || 'Có lỗi xảy ra', 'error')
    });
  }

  deleteStaff(id: number) {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Xóa nhân viên sẽ không thể khôi phục!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.partnerService.deleteStaff(id).subscribe({
          next: () => {
            Swal.fire('Đã xóa!', 'Nhân viên đã bị xóa.', 'success');
            this.staffs = this.staffs.filter(staff => staff.id !== id);
            this.cdr.detectChanges();
          },
          error: () => Swal.fire('Lỗi', 'Không thể xóa nhân viên', 'error')
        });
      }
    });
  }
}