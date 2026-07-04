import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

// SỬA: Lùi 3 cấp thư mục (../../../) để vào thư mục services gốc
import { PartnerService } from '../../../services/partner.service'; // Chắc chắn rằng tên file là partner.service.ts

@Component({
  selector: 'app-partner-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './partner-register.html',
  styleUrl: './partner-register.css' // Angular 17+ dùng styleUrl
})
export class PartnerRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  selectedLicenseFile: File | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder, 
    private partnerService: PartnerService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      account: this.fb.group({
        firstName: ['', Validators.required], 
        lastName: ['', Validators.required],  
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]]
      }),
      property: this.fb.group({
        propertyName: ['', Validators.required],
        propertyType: ['hotel', Validators.required],
        taxCode: ['', Validators.required]
      }),
      location: this.fb.group({
        city: ['', Validators.required],
        address: ['', Validators.required]
      }),
      facilities: this.fb.group({
        hasWifi: [false],
        hasParking: [false],
        has24hReception: [false],
        hasPool: [false]
      })
    });
  }

  nextStep() { if (this.currentStep < this.totalSteps) this.currentStep++; }
  prevStep() { if (this.currentStep > 1) this.currentStep--; }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedLicenseFile = file;
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      
      const account = this.registerForm.get('account')?.value;
      const property = this.registerForm.get('property')?.value;
      const location = this.registerForm.get('location')?.value;

      // 1. Tạo FormData để gửi multipart/form-data
      const formData = new FormData();

      // 2. Gắn các biến
      formData.append('last_name', account.firstName); 
      formData.append('first_name', account.lastName); 
      formData.append('email', account.email);
      formData.append('password', account.password);
      formData.append('phone', account.phone);
      
      formData.append('hotel_name', property.propertyName);
      formData.append('city', location.city);
      formData.append('address', location.address);

      // Nếu có chọn file giấy phép kinh doanh thì gửi luôn
      if (this.selectedLicenseFile) {
        formData.append('business_license', this.selectedLicenseFile);
      }

      // 3. Gọi API đăng ký
      this.partnerService.registerPartner(formData).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          alert('Đăng ký thành công! Hệ thống đang chờ Admin duyệt.');
          // this.router.navigate(['/partner/login']);
        },
        error: (error: any) => {
          this.isSubmitting = false;
          console.error('Lỗi API:', error);
          
          let errorMessage = 'Đăng ký thất bại';
          if (error.error && error.error.errors) {
            // Lấy thông báo lỗi cụ thể từ Laravel
            const firstError = Object.values(error.error.errors)[0] as string[];
            errorMessage = firstError[0];
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          alert(errorMessage);
        }
      });

    } else {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc có dấu * !');
      this.registerForm.markAllAsTouched();
    }
  }
}