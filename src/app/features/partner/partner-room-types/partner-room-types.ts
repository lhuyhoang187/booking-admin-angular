import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../services/partner.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-partner-room-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-room-types.html',
  styleUrl: './partner-room-types.css'
})
export class PartnerRoomTypesComponent implements OnInit {
  rooms: any[] = [];
  
  roomForm: any = { 
    name: '', base_price: 0, max_adults: 2, max_children: 0, 
    view_id: null, bed_type_id: null,
    room_size: null, description: '', has_breakfast: 0, 
    cancellation_policy: '', smoking_policy: 0 
  };
  editingRoomId: number | null = null;
  showTypeModal: boolean = false; 

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  allRoomAmenities: any[] = [];
  selectedAmenityIds: number[] = [];

  allRoomViews: any[] = [];
  allBedTypes: any[] = [];

  showPhysModal: boolean = false; 
  isEditPhysMode: boolean = false;
  physRoomForm: any = { id: null, room_type_id: 0, room_name: '', status: 1 };

  constructor(
    private router: Router,
    private partnerService: PartnerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('partner_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (Number(user.role_id) === 3) {
        Swal.fire('Từ chối truy cập', 'Bạn là Lễ tân, không có quyền vào trang này!', 'error');
        this.router.navigate(['/dashboard/room-matrix']);
        return;
      }
    }
    this.loadAllData();
    this.loadAmenities();
  }

  // 👉 ĐÃ SỬA: Bỏ Swal Loading, chỉ dùng ChangeDetectorRef để cập nhật ngầm
  loadAllData() {
    forkJoin({
      typesRes: this.partnerService.getRoomTypes(),
      physRes: this.partnerService.getRooms()
    }).subscribe({
      next: ({ typesRes, physRes }: any) => {
        const roomTypes = typesRes.room_types || [];
        const physRooms = physRes.data || [];

        this.rooms = roomTypes.map((type: any) => ({
          ...type,
          physicalRooms: physRooms.filter((pr: any) => pr.room_type_id === type.id)
        }));

        this.allRoomViews = typesRes.all_room_views || [];
        this.allBedTypes = typesRes.all_bed_types || [];
        
        // Cập nhật giao diện mượt mà không làm chớp màn hình
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Lỗi tải dữ liệu", err);
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Có lỗi khi tải dữ liệu từ máy chủ!' });
      }
    });
  }

  loadAmenities() {
    this.partnerService.getRoomAmenities().subscribe({
      next: (res: any) => {
        this.allRoomAmenities = (res.data || []).map((item: any) => ({ ...item, id: Number(item.id) }));
        this.cdr.detectChanges();
      }
    });
  }

  openTypeModal(room?: any) {
    if (room) {
      this.editingRoomId = room.id;
      this.roomForm = { 
        ...room, 
        view_id: room.view_id ? Number(room.view_id) : null, 
        bed_type_id: room.bed_type_id ? Number(room.bed_type_id) : null,
        has_breakfast: room.has_breakfast ? 1 : 0,
        smoking_policy: room.smoking_policy ? 1 : 0
      };
      this.selectedFiles = [];
      this.imagePreviews = [];
      this.selectedAmenityIds = room.amenities ? room.amenities.map((a: any) => Number(a.id)) : [];
    } else {
      this.resetTypeForm();
    }
    this.showTypeModal = true;
  }

  closeTypeModal() {
    this.showTypeModal = false;
  }

  resetTypeForm() {
    this.editingRoomId = null;
    this.roomForm = { 
      name: '', base_price: 0, max_adults: 2, max_children: 0, 
      view_id: null, bed_type_id: null,
      room_size: null, description: '', has_breakfast: 0, 
      cancellation_policy: '', smoking_policy: 0 
    };
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.selectedAmenityIds = [];
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
      this.imagePreviews = [];
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => { this.imagePreviews.push(e.target.result); this.cdr.detectChanges(); };
        reader.readAsDataURL(file);
      });
    }
  }

  toggleAmenity(amenityId: any, event: any) {
    const id = Number(amenityId);
    if (event.target.checked) {
      if (!this.selectedAmenityIds.includes(id)) this.selectedAmenityIds.push(id);
    } else {
      this.selectedAmenityIds = this.selectedAmenityIds.filter(val => val !== id);
    }
  }

  saveRoom() {
    Swal.fire({ title: 'Đang lưu...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    const formData = new FormData();
    formData.append('name', this.roomForm.name);
    formData.append('base_price', (this.roomForm.base_price || 0).toString());
    formData.append('max_adults', (this.roomForm.max_adults || 0).toString());
    formData.append('max_children', (this.roomForm.max_children || 0).toString());
    
    if (this.roomForm.view_id) formData.append('view_id', this.roomForm.view_id.toString());
    if (this.roomForm.bed_type_id) formData.append('bed_type_id', this.roomForm.bed_type_id.toString());
    
    if (this.roomForm.room_size) formData.append('room_size', this.roomForm.room_size.toString());
    if (this.roomForm.description) formData.append('description', this.roomForm.description);
    if (this.roomForm.cancellation_policy) formData.append('cancellation_policy', this.roomForm.cancellation_policy);
    formData.append('has_breakfast', this.roomForm.has_breakfast ? '1' : '0');
    formData.append('smoking_policy', this.roomForm.smoking_policy ? '1' : '0');

    this.selectedAmenityIds.forEach(id => formData.append('amenity_ids[]', id.toString()));
    this.selectedFiles.forEach(file => formData.append('media[]', file));

    const apiCall = this.editingRoomId ? this.partnerService.updateRoomType(this.editingRoomId, formData) : this.partnerService.addRoomType(formData);

    apiCall.subscribe({
      next: (res: any) => {
        Swal.fire({ icon: 'success', title: 'Thành công!', showConfirmButton: false, timer: 1500 });
        this.closeTypeModal();
        this.loadAllData();
      },
      error: (err: any) => {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi khi lưu loại phòng!' });
      }
    });
  }

  deleteRoom(id: number) {
    Swal.fire({
      title: 'Xóa loại phòng?',
      text: 'Toàn bộ ảnh và phòng vật lý bên trong sẽ bị xóa!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Vâng, xóa nó!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.partnerService.deleteRoomType(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Đã xóa!', showConfirmButton: false, timer: 1500 });
            this.loadAllData();
          }
        });
      }
    });
  }

  getRoomImage(room: any): string {
    if (room.media && room.media.length > 0) {
      return `http://localhost:8000/api/get-image?path=${encodeURIComponent(room.media[room.media.length - 1].file_url)}`;
    }
    return 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=200&q=80';
  }

  // ==========================================
  // LOGIC CHO PHÒNG VẬT LÝ (BÊN PHẢI)
  // ==========================================
  openPhysModal(roomTypeId: number, physRoom?: any) {
    if (physRoom) {
      this.isEditPhysMode = true;
      this.physRoomForm = { ...physRoom };
    } else {
      this.isEditPhysMode = false;
      this.physRoomForm = { id: null, room_type_id: roomTypeId, room_name: '', status: 1 };
    }
    this.showPhysModal = true;
  }

  closePhysModal() {
    this.showPhysModal = false;
  }

  savePhysRoom() {
    if (!this.physRoomForm.room_name.trim()) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng nhập số/tên phòng!' });
      return;
    }
    const apiCall = this.isEditPhysMode && this.physRoomForm.id
      ? this.partnerService.updateRoom(this.physRoomForm.id, this.physRoomForm)
      : this.partnerService.addRoom(this.physRoomForm);

    apiCall.subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Thành công!', showConfirmButton: false, timer: 1500 });
        this.closePhysModal();
        this.loadAllData();
      },
      error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi hệ thống' })
    });
  }

  deletePhysRoom(id: number) {
    Swal.fire({
      title: 'Xóa phòng này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Xóa'
    }).then((result) => {
      if (result.isConfirmed) {
        this.partnerService.deleteRoom(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Đã xóa!', showConfirmButton: false, timer: 1500 });
            this.closePhysModal(); // 👉 ĐÃ SỬA: Đóng Modal ngay lập tức khi xóa thành công
            this.loadAllData();
          }
        });
      }
    });
  }
}