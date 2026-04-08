import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking'; // Đảm bảo đường dẫn đúng

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class BookingsComponent implements OnInit {
  bookings: any[] = [];
  message: string = '';

  constructor(
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getBookings().subscribe({
      next: (res: any) => {
        // Tùy theo cấu trúc Laravel trả về, có thể là res.bookings hoặc res.data
        this.bookings = res.bookings || res.data || [];
        this.cdr.detectChanges(); 
      },
      error: (err: any) => console.log(err)
    });
  }

  confirmBooking(id: number) {
    if(confirm('Xác nhận đơn đặt phòng này?')) {
      this.bookingService.confirmBooking(id).subscribe({
        next: (res: any) => {
          this.showMessage('Đã xác nhận đơn hàng thành công!');
          this.loadBookings(); // Tải lại danh sách
        },
        error: (err: any) => this.showMessage('Lỗi khi xác nhận đơn!')
      });
    }
  }

  checkInBooking(id: number) {
    if(confirm('Xác nhận khách đã đến nhận phòng?')) {
      this.bookingService.checkInBooking(id).subscribe({
        next: (res: any) => {
          this.showMessage('Check-in thành công!');
          this.loadBookings();
        },
        error: (err: any) => this.showMessage('Lỗi khi check-in!')
      });
    }
  }

  cancelBooking(id: number) {
    if(confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      this.bookingService.cancelBooking(id).subscribe({
        next: (res: any) => {
          this.showMessage('Đã hủy đơn hàng!');
          this.loadBookings();
        },
        error: (err: any) => this.showMessage('Lỗi khi hủy đơn!')
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