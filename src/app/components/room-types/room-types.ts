import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomTypeService } from '../../services/room-type';

@Component({
  selector: 'app-room-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-types.html',
  styleUrl: './room-types.css'
})
export class RoomTypesComponent implements OnInit {
  rooms: any[] = [];
  roomForm: any = { name: '', base_price: 0, max_adults: 2, max_children: 0 };
  message: string = '';
  editingRoomId: number | null = null; 
  
  selectedFiles: File[] = []; // Chứa danh sách file đang chọn

  constructor(
    private roomTypeService: RoomTypeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadRooms(); }

  loadRooms() {
    this.roomTypeService.getRooms().subscribe({
      next: (res: any) => {
        this.rooms = res.room_types || [];
        this.cdr.detectChanges(); 
      },
      error: (err: any) => console.log(err)
    });
  }

  // Bắt sự kiện khi người dùng chọn file
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  saveRoom() {
    if (this.editingRoomId) {
      this.roomTypeService.updateRoom(this.editingRoomId, this.roomForm).subscribe({
        next: (res: any) => {
          this.handleMediaUpload(this.editingRoomId!);
        },
        error: (err: any) => this.showMessage('Lỗi khi cập nhật phòng!')
      });
    } else {
      this.roomTypeService.createRoom(this.roomForm).subscribe({
        next: (res: any) => {
          this.handleMediaUpload(res.room_type.id);
        },
        error: (err: any) => this.showMessage('Lỗi khi thêm phòng!')
      });
    }
  }

  // Hàm phụ: Tải file lên ngay sau khi lưu phòng thành công
  handleMediaUpload(roomId: number) {
    if (this.selectedFiles.length === 0) {
      this.showMessage('Lưu thông tin phòng thành công!');
      this.resetForm();
      this.loadRooms();
      return;
    }

    const formData = new FormData();
    this.selectedFiles.forEach(file => {
      formData.append('media[]', file);
    });

    this.roomTypeService.uploadMedia(roomId, formData).subscribe({
      next: (res: any) => {
        this.showMessage('Lưu phòng & tải media lên thành công!');
        this.resetForm();
        this.loadRooms();
      },
      error: (err: any) => {
        this.showMessage('Phòng đã lưu nhưng tải ảnh/video thất bại!');
      }
    });
  }

  editRoom(room: any) {
    this.editingRoomId = room.id;
    this.roomForm = { ...room };
    this.selectedFiles = []; // Reset list file khi chuyển sang chế độ sửa
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  resetForm() {
    this.editingRoomId = null;
    this.roomForm = { name: '', base_price: 0, max_adults: 2, max_children: 0 };
    this.selectedFiles = [];
    
    // Reset giao diện nút chọn file
    const fileInput = document.getElementById('mediaInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    this.cdr.detectChanges();
  }

  deleteRoom(id: number) {
    if(confirm('Bạn có chắc chắn muốn xóa loại phòng này?')) {
      this.roomTypeService.deleteRoom(id).subscribe({
        next: (res: any) => {
          this.showMessage('Xóa thành công!');
          this.loadRooms();
        },
        error: (err: any) => console.log(err)
      });
    }
  }

  showMessage(msg: string) {
    this.message = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.message = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}