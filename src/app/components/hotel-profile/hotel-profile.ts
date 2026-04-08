import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- 1. Import thêm ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel';

@Component({
  selector: 'app-hotel-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-profile.html',
  styleUrl: './hotel-profile.css'
})
export class HotelProfileComponent implements OnInit {
  profile: any = {
    name: '',
    address: '',
    city: '',
    star_rating: 3,
    description: ''
  };
  message: string = '';

  constructor(
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef // <-- 2. Khai báo công cụ ép cập nhật vào đây
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.hotelService.getProfile().subscribe({
      next: (res: any) => {
        if (res.hotel) {
          this.profile = res.hotel;
          this.cdr.detectChanges(); // <-- 3. Ép Angular vẽ lại giao diện ngay lập tức khi có dữ liệu về!
        }
      },
      error: (err: any) => console.log(err)
    });
  }

  saveProfile() {
    this.hotelService.updateProfile(this.profile).subscribe({
      next: (res: any) => {
        this.message = 'Lưu thông tin thành công!';
        this.cdr.detectChanges(); // Ép hiện thông báo
        
        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges(); // Ép ẩn thông báo sau 3 giây
        }, 3000);
      },
      error: (err: any) => {
        this.message = 'Có lỗi xảy ra khi lưu!';
        this.cdr.detectChanges();
      }
    });
  }
}