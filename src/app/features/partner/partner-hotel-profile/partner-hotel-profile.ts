import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Router } from '@angular/router'; 

import { HotelService } from '../../../services/hotel.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-partner-hotel-profile', 
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-hotel-profile.html',
  styleUrl: './partner-hotel-profile.css'
})
export class PartnerHotelProfileComponent implements OnInit { 
  profile: any = {
    name: '', address: '', city: '', star_rating: 3, description: '', tax_code: '', business_license_url: ''
  };
  message: string = '';

  provinces: any[] = []; districts: any[] = []; wards: any[] = [];
  selectedProvinceCode: string = ''; selectedDistrictCode: string = ''; selectedWardCode: string = '';
  selectedDistrictName: string = ''; selectedWardName: string = ''; streetAddress: string = ''; 

  isProfileLoaded = false; isProvincesLoaded = false;

  // BIẾN QUẢN LÝ ẢNH
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  
  // 👉 THÊM MỚI: Biến quản lý Ảnh giấy phép
  selectedLicenseFile: File | null = null;
  licensePreviewUrl: string | ArrayBuffer | null = null;

  constructor(
    private router: Router,
    private hotelService: HotelService, 
    private cdr: ChangeDetectorRef, 
    private http: HttpClient
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('partner_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (Number(user.role_id) !== 1) { // Đổi về check Role 1 theo chuẩn RBAC
        Swal.fire('Từ chối', 'Chỉ chủ khách sạn mới được cập nhật hồ sơ!', 'error');
        this.router.navigate(['/dashboard/room-matrix']); 
        return; 
      }
    }

    this.loadProvinces(); 
    this.loadProfile();
  }

  loadProvinces() {
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then(res => res.json())
      .then(res => {
        if (res.error === 0) {
          this.provinces = res.data.map((item: any) => ({ code: item.id, name: item.full_name }));
          this.isProvincesLoaded = true;
          this.autoBindAddress(); 
          this.cdr.detectChanges();
        }
      });
  }

  loadProfile() {
    this.hotelService.getProfile().subscribe({
      next: (res: any) => {
        if (res.hotel) {
          this.profile = res.hotel;
          this.streetAddress = this.profile.address || '';
          
          if (this.profile.images && this.profile.images.length > 0) {
            const lastIndex = this.profile.images.length - 1;
            const imgPath = this.profile.images[lastIndex].file_url;
            this.imagePreviewUrl = `http://localhost:8000/api/get-image?path=${encodeURIComponent(imgPath)}`;
          }

          // 👉 THÊM MỚI: Load ảnh giấy phép hiện tại
          if (this.profile.business_license_url) {
            this.licensePreviewUrl = `http://localhost:8000/api/get-image?path=${encodeURIComponent(this.profile.business_license_url)}`;
          }

          this.isProfileLoaded = true;
          this.autoBindAddress(); 
          this.cdr.detectChanges(); 
        }
      },
      error: (err: any) => console.log(err)
    });
  }

  autoBindAddress() {
    if (!this.isProfileLoaded || !this.isProvincesLoaded) return;
    if (!this.profile.city) return;

    const p = this.provinces.find(x => x.name === this.profile.city || this.profile.city.includes(x.name));
    if (p) {
      this.profile.city = p.name; 
      fetch(`https://esgoo.net/api-tinhthanh/2/${p.code}.htm`)
        .then(res => res.json())
        .then(res => {
          if (res.error === 0) {
            this.districts = res.data.map((item: any) => ({ code: item.id, name: item.full_name }));
            if (this.profile.address) {
              const d = this.districts.find(x => this.profile.address.includes(x.name));
              if (d) {
                this.selectedDistrictName = d.name;
                fetch(`https://esgoo.net/api-tinhthanh/3/${d.code}.htm`)
                  .then(res => res.json())
                  .then(res => {
                    if (res.error === 0) {
                      this.wards = res.data.map((item: any) => ({ code: item.id, name: item.full_name }));
                      const w = this.wards.find(x => this.profile.address.includes(x.name));
                      if (w) {
                        this.selectedWardName = w.name;
                        let street = this.profile.address.replace(', ' + w.name, '').replace(', ' + d.name, '').replace(w.name, '').replace(d.name, '').trim();
                        if(street.endsWith(',')) street = street.slice(0, -1).trim();
                        this.streetAddress = street;
                      }
                      this.cdr.detectChanges();
                    }
                  });
              }
            }
            this.cdr.detectChanges();
          }
        });
    }
  }

  onProvinceChange() {
    const p = this.provinces.find(x => x.name === this.profile.city);
    this.districts = []; this.wards = []; this.selectedDistrictName = ''; this.selectedWardName = '';
    if (!p) { this.cdr.detectChanges(); return; }

    fetch(`https://esgoo.net/api-tinhthanh/2/${p.code}.htm`)
      .then(res => res.json())
      .then(res => {
        if (res.error === 0) {
          this.districts = res.data.map((item: any) => ({ code: item.id, name: item.full_name }));
          this.cdr.detectChanges();
        }
      });
  }

  onDistrictChange() {
    const d = this.districts.find(x => x.name === this.selectedDistrictName);
    this.wards = []; this.selectedWardName = '';
    if (!d) { this.cdr.detectChanges(); return; }

    fetch(`https://esgoo.net/api-tinhthanh/3/${d.code}.htm`)
      .then(res => res.json())
      .then(res => {
        if (res.error === 0) {
          this.wards = res.data.map((item: any) => ({ code: item.id, name: item.full_name }));
          this.cdr.detectChanges();
        }
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; 
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  // 👉 THÊM MỚI: Hàm chọn ảnh giấy phép
  onLicenseFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedLicenseFile = file; 
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.licensePreviewUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    let fullAddress = this.streetAddress;
    if (this.wards.find(x => x.name === this.selectedWardName)) fullAddress += ', ' + this.selectedWardName;
    if (this.districts.find(x => x.name === this.selectedDistrictName)) fullAddress += ', ' + this.selectedDistrictName;
    if (fullAddress.trim() !== '') this.profile.address = fullAddress;

    this.hotelService.updateProfile(this.profile).subscribe({
      next: (res: any) => {
        // Nếu có upload ảnh bất kỳ (ảnh bìa hoặc giấy phép)
        if (this.selectedFile || this.selectedLicenseFile) {
          const formData = new FormData();
          if(this.selectedFile) {
            formData.append('image', this.selectedFile);
            formData.append('is_primary', '1');
          }
          if(this.selectedLicenseFile) {
            formData.append('business_license_image', this.selectedLicenseFile);
          }

          let activeToken = '';
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              const val = localStorage.getItem(key);
              if (val) {
                if (val.includes('|') && val.length > 20 && !val.startsWith('{')) {
                  activeToken = val; break;
                }
                try {
                  const obj = JSON.parse(val);
                  if (obj && typeof obj === 'object') {
                    if (obj.token) { activeToken = obj.token; break; }
                    if (obj.access_token) { activeToken = obj.access_token; break; }
                  }
                } catch(e) {}
              }
            }
          }

          if (!activeToken) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không tìm thấy Token!', confirmButtonText: 'Đóng' });
            return;
          }

          const headers = new HttpHeaders({ 'Authorization': `Bearer ${activeToken}` });

          this.http.post('http://localhost:8000/api/partner/hotel/images', formData, { headers })
            .subscribe({
              next: () => {
                Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Lưu thông tin & hình ảnh thành công!', showConfirmButton: false, timer: 1500 });
                this.selectedFile = null; 
                this.selectedLicenseFile = null;
                this.loadProfile(); 
              },
              error: (err) => {
                console.error('Lỗi up ảnh:', err);
                Swal.fire({ icon: 'warning', title: 'Cảnh báo', text: 'Lưu thông tin chữ thành công, nhưng tải ảnh bị lỗi!', confirmButtonText: 'Đóng' });
              }
            });
        } else {
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Cập nhật thông tin thành công!', showConfirmButton: false, timer: 1500 });
        }
      },
      error: (err: any) => {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Có lỗi xảy ra khi lưu!', confirmButtonText: 'Đóng' });
      }
    });
  }
}