import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
// Điều chỉnh lại đường dẫn import service tùy theo cấu trúc thư mục thực tế của bạn
import { PartnerService } from '../../../services/partner.service'; 

@Component({
  selector: 'app-partner-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-profile.html', // Trỏ đúng tên file HTML của bạn
  styleUrls: ['./partner-profile.css']   // Trỏ đúng tên file CSS của bạn
})
export class PartnerProfileComponent implements OnInit {
  activeTab: 'profile' | 'security' = 'profile';
  isLoading = true;

  // Dữ liệu Tab 1 (Hồ sơ)
  profileData = {
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  };

  // Dữ liệu Tab 2 (Bảo mật)
  passwordData = {
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  };

  constructor(private partnerService: PartnerService) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.partnerService.getProfile().subscribe({
      next: (res: any) => {
        this.profileData = {
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          email: res.data.email,
          phone: res.data.phone || ''
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  updateProfile() {
    if (!this.profileData.first_name || !this.profileData.last_name) {
      Swal.fire('Lỗi', 'Họ và Tên không được để trống!', 'warning');
      return;
    }

    this.partnerService.updateProfile(this.profileData).subscribe({
      next: (res: any) => {
        Swal.fire('Thành công', res.message, 'success');
        
        // Cập nhật lại tên hiển thị trên Header (nếu bạn có lưu tên trong localStorage)
        const currentUserStr = localStorage.getItem('partner_user');
        if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            currentUser.first_name = this.profileData.first_name;
            currentUser.last_name = this.profileData.last_name;
            localStorage.setItem('partner_user', JSON.stringify(currentUser));
        }
      },
      error: (err) => Swal.fire('Lỗi', err.error?.message || 'Không thể cập nhật!', 'error')
    });
  }

  changePassword() {
    if (!this.passwordData.current_password || !this.passwordData.new_password || !this.passwordData.new_password_confirmation) {
      Swal.fire('Lỗi', 'Vui lòng điền đầy đủ các trường mật khẩu!', 'warning');
      return;
    }

    if (this.passwordData.new_password !== this.passwordData.new_password_confirmation) {
      Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'warning');
      return;
    }

    this.partnerService.changePassword(this.passwordData).subscribe({
      next: (res: any) => {
        Swal.fire('Thành công', res.message, 'success');
        // Xóa trắng form sau khi đổi thành công
        this.passwordData = { current_password: '', new_password: '', new_password_confirmation: '' };
      },
      error: (err) => Swal.fire('Lỗi', err.error?.message || 'Đổi mật khẩu thất bại!', 'error')
    });
  }
}