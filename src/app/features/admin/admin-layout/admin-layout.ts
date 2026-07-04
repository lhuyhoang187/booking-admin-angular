import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css' // Cú pháp chuẩn của Angular 17+ là styleUrl, không phải styleUrls
})
export class AdminLayoutComponent implements OnInit {
  adminName = 'Quản trị viên';
  adminRole = 'Staff';

  constructor(private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const adminInfoRaw = localStorage.getItem('admin_info');
      if (adminInfoRaw) {
        const adminData = JSON.parse(adminInfoRaw);
        this.adminName = `${adminData.last_name} ${adminData.first_name}`;
        this.adminRole = adminData.role || 'Staff';
      } else {
        // Nếu không có thông tin đăng nhập, đá văng ra trang Login
        this.router.navigate(['/admin/login']);
      }
    }
  }

  onLogout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_info');
    }
    this.router.navigate(['/admin/login']);
  }
}