import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-contacts.html',
  styleUrl: './admin-contacts.css'
})
export class AdminContactsComponent implements OnInit {
  contacts: any[] = [];
  filteredContacts: any[] = [];
  statusFilter: string = '0'; 

  // 👉 THÊM BIẾN NÀY ĐỂ QUẢN LÝ MODAL
  selectedContactDetail: any = null;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.adminService.getSystemContacts().subscribe({
      next: (res: any) => {
        this.contacts = res.data || res || [];
        this.applyFilter();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Lỗi', 'Không thể tải danh sách liên hệ!', 'error');
      }
    });
  }

  applyFilter() {
    if (this.statusFilter === 'all') {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter(c => c.status.toString() === this.statusFilter);
    }
    this.cdr.detectChanges();
  }

  // 👉 THÊM 2 HÀM NÀY ĐỂ MỞ/ĐÓNG MODAL
  openDetailModal(contact: any) {
    this.selectedContactDetail = contact;
  }

  closeDetailModal() {
    this.selectedContactDetail = null;
  }

  handleResolve(id: number) {
    Swal.fire({
      title: 'Đăng ký đã xử lý?',
      text: 'Bạn có chắc chắn muốn đánh dấu tin nhắn này đã được giải quyết?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đúng, Đã xong!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.resolveContact(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Đã cập nhật trạng thái!', showConfirmButton: false, timer: 1500 });
            this.loadContacts(); 
            // Nếu đang mở Modal thì đóng lại
            if (this.selectedContactDetail && this.selectedContactDetail.id === id) {
                this.closeDetailModal();
            }
          },
          error: (err) => Swal.fire('Lỗi', 'Không thể cập nhật trạng thái!', 'error')
        });
      }
    });
  }
}