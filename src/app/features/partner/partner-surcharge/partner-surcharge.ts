import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../services/partner.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router'; 


@Component({
  selector: 'app-partner-surcharge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-surcharge.html',
  styleUrl: './partner-surcharge.css'
})
export class PartnerSurchargeComponent implements OnInit {
  list: any[] = [];
  isLoading = false;
  showModal = false;
  isEdit = false;
  isSaving = false;

  item: any = {
    id: null,
    name: '',
    description: ''
  };

  constructor(
    private router: Router,

    private partnerService: PartnerService,
    private cdr: ChangeDetectorRef 
  ) {}

  // HÀM NÀY CHẠY NGAY KHI MỞ TRANG
  ngOnInit(): void {
    
// =========================================
    // LỚP BẢO VỆ: KIỂM TRA QUYỀN TRƯỚC KHI TẢI TRANG
    // =========================================
    const userStr = localStorage.getItem('partner_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // Lễ tân (role_id = 3) không được vào trang này
      if (Number(user.role_id) === 3) {
        Swal.fire('Từ chối truy cập', 'Bạn là Lễ tân, không có quyền vào trang này!', 'error');
        this.router.navigate(['/dashboard/room-matrix']); // Đá văng ra trang sơ đồ phòng
        return; // Dừng lập tức, không chạy code tải dữ liệu bên dưới
      }
    }

    this.loadData();
  }

  loadData() {
    
    this.isLoading = true;
    
    this.partnerService.getSurchargeCategories().subscribe({
      next: (res: any) => {
        console.log('API trả về:', res);
        
        // 2. Ép kiểu an toàn: Chắc chắn list phải là 1 mảng (Array)
        if (res && res.data && Array.isArray(res.data)) {
          this.list = res.data;
        } else if (Array.isArray(res)) {
          this.list = res;
        } else {
          this.list = []; // Nếu API trả về tào lao, gán thành mảng rỗng để không bị sập web
        }

        this.isLoading = false; // Tắt cờ loading
        this.cdr.detectChanges(); // 3. LỆNH ÉP BUỘC ANGULAR VẼ LẠI GIAO DIỆN NGAY LẬP TỨC!
      },
      error: (err) => {
        console.error('Lỗi API:', err);
        this.isLoading = false;
        this.cdr.detectChanges(); // Lỗi cũng phải ép vẽ lại giao diện để tắt loading
      }
    });
  }

  openModal(data: any = null) {
    this.showModal = true;
    if (data) {
      this.isEdit = true;
      this.item = { ...data };
    } else {
      this.isEdit = false;
      this.item = { id: null, name: '', description: '' };
    }
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (!this.item.name) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng nhập tên loại phụ thu!', confirmButtonText: 'Đóng' });
      return;
    }

    if (this.isSaving) return;
    this.isSaving = true;

    if (this.isEdit) {
      this.partnerService.updateSurchargeCategory(this.item.id, this.item).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', showConfirmButton: false, timer: 1500 });
          this.closeModal();
          this.loadData();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Lỗi cập nhật:', err);
          Swal.fire({ icon: 'error', title: 'Thất bại', text: 'Lỗi cập nhật!', confirmButtonText: 'Đóng' });
          this.isSaving = false;
        }
      });
    } else {
      this.partnerService.addSurchargeCategory(this.item).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Thêm mới thành công!', showConfirmButton: false, timer: 1500 });
          this.closeModal();
          this.loadData();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Lỗi thêm mới:', err);
          Swal.fire({ icon: 'error', title: 'Thất bại', text: 'Lỗi thêm mới!', confirmButtonText: 'Đóng' });
          this.isSaving = false;
        }
      });
    }
  }

  delete(id: number) {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Dữ liệu sau khi xóa sẽ không thể khôi phục!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Vâng, xóa nó!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.partnerService.deleteSurchargeCategory(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Đã xóa!', text: 'Loại phụ thu đã được xóa.', showConfirmButton: false, timer: 1500 });
            this.loadData();
          },
          error: (err) => {
            console.error('Lỗi khi xóa:', err);
            Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Không thể xóa do dữ liệu đang được sử dụng!', confirmButtonText: 'Đóng' });
          }
        });
      }
    });
  }
}