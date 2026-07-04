import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Sửa lại đường dẫn lùi 3 cấp để trỏ chuẩn xác về cấu phần dịch vụ gốc
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-customers.html',
  styleUrl: './admin-customers.css'
})
export class AdminCustomersComponent implements OnInit {
  customerList: any[] = [];
  isLoading = true;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.adminService.getCustomers().subscribe({
      next: (res: any) => {
        this.customerList = res.data || [];
        this.isLoading = false;
        
        // Ép giao diện đồng bộ trạng thái và kết xuất dữ liệu tức thì
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error("Lỗi:", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(id: number, currentStatus: number) {
    const action = currentStatus == 1 ? 'KHÓA' : 'MỞ KHÓA';
    if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản này không?`)) {
      this.adminService.toggleCustomerStatus(id).subscribe({
        next: (res: any) => {
          alert(res.message);
          this.loadData();
        },
        error: (err: any) => alert(err.error?.message || "Lỗi xử lý.")
      });
    }
  }
}