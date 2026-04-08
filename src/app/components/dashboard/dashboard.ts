import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Bắt buộc phải có RouterModule
import { AuthService } from '../../services/auth.service'; // Đổi thành auth.ts nếu máy bạn rút gọn

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], // Import vào đây
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css' // Trỏ tới file CSS
})
export class DashboardComponent {
  
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Đá về trang đăng nhập ngay lập tức
  }
}