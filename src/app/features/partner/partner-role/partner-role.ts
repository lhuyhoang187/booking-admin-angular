import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../services/partner.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-partner-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-role.html',
  styleUrls: ['./partner-role.css']
})
export class PartnerRoleComponent implements OnInit {
  roles: any[] = [];
  isLoading = true;
  showModal = false;
  isEditMode = false;

  formData = {
    id: null,
    name: '',
    permissions: [] as string[]
  };

  // Khai báo danh sách TẤT CẢ các quyền có trong hệ thống
  availablePermissions = [
    { key: 'overview', name: 'Thống kê & Tổng quan' },
    { key: 'hotel', name: 'Hồ sơ Khách sạn' },
    { key: 'room_types', name: 'Quản lý Loại phòng' },
    { key: 'room_matrix', name: 'Sơ đồ & Số phòng' },
    { key: 'bookings', name: 'Quản lý Đơn hàng' },
    { key: 'hotel_amenities', name: 'Tiện ích Khách sạn' },
    { key: 'services', name: 'Dịch vụ đi kèm' },
    { key: 'minibar', name: 'Quản lý Minibar' },
    { key: 'supplies', name: 'Quản lý Vật tư' },
    { key: 'promotions', name: 'Mã Khuyến mãi' },
    { key: 'partner_surcharge', name: 'Quản lý Phụ thu' },
    { key: 'staffs', name: 'Quản lý Nhân viên' },
    { key: 'roles', name: 'Quản lý Phân quyền' },
    { key: 'support', name: 'Chat & Hỗ trợ khách hàng' }
  ];

  constructor(
    private router: Router,
    private partnerService: PartnerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('partner_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (Number(user.role_id) !== 1) {
        Swal.fire('Từ chối truy cập', 'Chỉ Chủ khách sạn mới có quyền quản lý nhóm quyền!', 'error');
        this.router.navigate(['/dashboard/room-matrix']);
        return;
      }
    }
    this.loadRoles();
  }

  loadRoles() {
    this.partnerService.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.formData = { id: null, name: '', permissions: [] };
    this.showModal = true;
  }

  openEditModal(role: any) {
    this.isEditMode = true;
    this.formData = { 
      id: role.id, 
      name: role.name, 
      permissions: role.permissions || [] 
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // Bắt sự kiện Checkbox
  togglePermission(key: string, event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.formData.permissions.push(key);
    } else {
      this.formData.permissions = this.formData.permissions.filter(p => p !== key);
    }
  }

  // Kiểm tra Checkbox có đang được tick không
  hasPermission(key: string): boolean {
    return this.formData.permissions.includes(key);
  }

  saveRole() {
    if (!this.formData.name || this.formData.permissions.length === 0) {
      Swal.fire('Lỗi', 'Vui lòng nhập tên nhóm và chọn ít nhất 1 quyền.', 'warning');
      return;
    }

    const req = this.isEditMode 
      ? this.partnerService.updateRole(this.formData.id!, this.formData)
      : this.partnerService.createRole(this.formData);

    req.subscribe({
      next: (res: any) => {
        Swal.fire('Thành công', res.message, 'success');
        this.closeModal();
        this.loadRoles();
      },
      error: (err) => Swal.fire('Lỗi', err.error?.message || 'Lỗi hệ thống', 'error')
    });
  }

  deleteRole(id: number) {
    Swal.fire({
      title: 'Xóa nhóm quyền?',
      text: "Nhóm quyền đang có nhân viên sẽ không thể xóa!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý xóa'
    }).then((result) => {
      if (result.isConfirmed) {
        this.partnerService.deleteRole(id).subscribe({
          next: () => {
            Swal.fire('Đã xóa', '', 'success');
            this.loadRoles();
          },
          error: (err) => Swal.fire('Lỗi', err.error?.message || 'Không thể xóa', 'error')
        });
      }
    });
  }
}