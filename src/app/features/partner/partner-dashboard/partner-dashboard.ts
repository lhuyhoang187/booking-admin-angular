import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 

import { AuthService } from '../../../services/auth.service'; 
import { PartnerService } from '../../../services/partner.service';

@Component({
  selector: 'app-partner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './partner-dashboard.html',
  styleUrl: './partner-dashboard.css' 
})
export class PartnerDashboardComponent implements OnInit, OnDestroy { 
  
  userRole: number = 0;
  permissions: string[] = []; // 👉 THÊM MỚI: Mảng lưu danh sách các quyền động của tài khoản
  newContactCount: number = 0;
  private intervalId: any; 

  constructor(
    private authService: AuthService, 
    private router: Router,
    private partnerService: PartnerService 
  ) {}

  ngOnInit() {
    this.initUser();
    this.loadUnreadContacts();

    this.intervalId = setInterval(() => {
      this.loadUnreadContacts();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  initUser() {
    const userStr = localStorage.getItem('partner_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userRole = user.role_id ? Number(user.role_id) : 1; 
        
        // 👉 ĐÃ THÊM: Đọc mảng permissions từ quan hệ role mà Laravel trả về khi đăng nhập
        this.permissions = user.role?.permissions || [];
      } catch (e) {
        this.userRole = 1;
        this.permissions = [];
      }
    } else {
      this.userRole = 1;
      this.permissions = [];
    }
  }

  // 👉 HÀM MỚI: Kiểm tra quyền động để Ẩn/Hiện Menu ngoài HTML
  hasPermission(permissionKey: string): boolean {
    if (this.userRole === 1) return true; // Nếu là Owner (Chủ khách sạn) thì mặc định có FULL QUYỀN
    return this.permissions.includes(permissionKey); // Nếu là nhân viên thì check xem có trong mảng JSON không
  }

  loadUnreadContacts() {
    this.partnerService.getChatThreads().subscribe({
      next: (res: any) => {
        const contacts = res.data || [];
        setTimeout(() => {
            this.newContactCount = contacts.filter((c: any) => c.status === 0).length;
        }, 0);
      }
    });
  }

  logout() {
    this.authService.logout();
    localStorage.removeItem('partner_user');
    localStorage.removeItem('partner_token');
    this.router.navigate(['/login']); 
  }
}