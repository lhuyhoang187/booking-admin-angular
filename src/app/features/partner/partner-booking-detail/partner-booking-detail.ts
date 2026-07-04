import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { BookingService } from '../../../services/booking.service';
import { PartnerService } from '../../../services/partner.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-partner-booking-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './partner-booking-detail.html',
  styleUrl: './partner-booking-detail.css'
})
export class PartnerBookingDetailComponent implements OnInit {
  bookingId: number = 0;
  booking: any = null;
  activeTab: 'checkin' | 'services' | 'checkout' = 'checkin';
  selectedPaymentMethod: number = 1; 
  isEditingGuests: boolean = false;
  editingGuests: any[] = [];        

  // Biến phục vụ Tab 1 (Check-in)
  availableRooms: any[] = [];
  selectedRoomIds: number[] = [];
  guests: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private partnerService: PartnerService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.bookingId = Number(params.get('id'));
      if (this.bookingId) {
        this.loadBookingDetail();
        this.loadSurchargeCategories(); // Tải danh mục Phụ thu
        this.loadSupplies();
        this.loadMenuAndCart();
      }
    });
  }

 loadBookingDetail() {
    this.bookingService.getBookingDetail(this.bookingId).subscribe({
      next: (res: any) => {
        this.booking = res.booking;
        
        // ==========================================
        // TÁCH DỊCH VỤ ĐI KÈM & MINIBAR ĐỂ HIỂN THỊ LÊN HÓA ĐƠN
        // Dùng '||' để phòng trường hợp Laravel trả về JSON có gạch dưới hoặc viết hoa
        const servicesList = this.booking.booking_services || this.booking.bookingServices || [];
        
        // Nhặt các món có type == 1 (Dịch vụ: Spa, Giặt ủi...)
        this.cartServices = servicesList.filter((item: any) => item.service?.type == 1);
        
        // Nhặt các món có type == 2 (Minibar: Nước, Bánh kẹo...)
        this.cartMinibars = servicesList.filter((item: any) => item.service?.type == 2);
        // ==========================================

        if (this.guests.length === 0) {
          this.guests.push({ full_name: this.booking.guest_name, identity_number: '' });
        }
        
        if (this.booking.status === 0 || this.booking.status === 1) {
           this.loadAvailableRooms();
        }

        this.calculateNights(); // Tính số đêm khi tải xong
        this.calculateCartTotal(); // Tính toán lại tổng tiền (bao gồm phụ thu, dịch vụ)
        
        this.cdr.detectChanges();
      },
      error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi tải dữ liệu đơn hàng!', confirmButtonText: 'Đóng' })
    });
  }
  loadAvailableRooms() {
    this.bookingService.getAvailableRooms(this.bookingId).subscribe({
      next: (res: any) => {
        this.availableRooms = res.rooms || [];
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // XỬ LÝ SỬA DANH SÁCH KHÁCH Ở TAB 1
  // ==========================================
  enableEditGuests() {
    this.isEditingGuests = true;
    this.editingGuests = JSON.parse(JSON.stringify(this.booking?.guests || []));
    if (this.editingGuests.length === 0) this.addEditingGuest();
  }

  addEditingGuest() { this.editingGuests.push({ full_name: '', identity_number: '' }); }
  removeEditingGuest(index: number) { this.editingGuests.splice(index, 1); }
  cancelEditGuests() { this.isEditingGuests = false; }

  saveGuests() {
    const validGuests = this.editingGuests.filter(g => g.full_name && g.full_name.trim() !== '');
    this.bookingService.updateGuests(this.bookingId, { guests: validGuests }).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Cập nhật danh sách khách thành công!', showConfirmButton: false, timer: 1500 });
        this.isEditingGuests = false;
        this.loadBookingDetail();
      },
      error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi cập nhật: ' + (err.error?.message || 'Vui lòng kiểm tra lại.'), confirmButtonText: 'Đóng' })
    });
  }  

  toggleRoomSelection(roomId: number) {
    const index = this.selectedRoomIds.indexOf(roomId);
    if (index > -1) {
      this.selectedRoomIds.splice(index, 1);
    } else {
      this.selectedRoomIds.push(roomId);
    }
  }

  addGuest() { this.guests.push({ full_name: '', identity_number: '' }); }
  removeGuest(index: number) { this.guests.splice(index, 1); }

  processCheckIn() {
    if (this.selectedRoomIds.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Cảnh báo', text: 'Vui lòng chọn ít nhất 1 phòng để giao cho khách!', confirmButtonText: 'Đóng' });
      return;
    }

    const payload = {
      room_ids: this.selectedRoomIds,
      guests: this.guests.filter(g => g.full_name.trim() !== '')
    };

    Swal.fire({
      title: 'Xác nhận?', text: 'Xác nhận hoàn tất thủ tục Check-in?', icon: 'question',
      showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Đồng ý', cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.submitCheckIn(this.bookingId, payload).subscribe({
          next: (res: any) => {
            Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Check-in thành công!', showConfirmButton: false, timer: 1500 });
            this.loadBookingDetail();
          },
          error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi Check-in: ' + (err.error?.message || 'Không xác định'), confirmButtonText: 'Đóng' })
        });
      }
    });
  }

  confirmOrder() {
    Swal.fire({
      title: 'Xác nhận đơn hàng?', text: 'Bạn có chắc chắn muốn XÁC NHẬN đơn hàng này?', icon: 'question',
      showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xác nhận', cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.confirmBooking(this.bookingId).subscribe({
          next: (res: any) => {
            Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Đã xác nhận đơn hàng!', showConfirmButton: false, timer: 1500 });
            this.loadBookingDetail();
          },
          error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi xác nhận: ' + (err.error?.message || 'Không rõ'), confirmButtonText: 'Đóng' })
        });
      }
    });
  }

  cancelOrder() {
    Swal.fire({
      title: 'Hủy đơn hàng?', text: 'Bạn có chắc chắn muốn TỪ CHỐI / HỦY đơn hàng này?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Vâng, Hủy đơn!', cancelButtonText: 'Đóng'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.cancelBooking(this.bookingId).subscribe({
          next: (res: any) => {
            Swal.fire({ icon: 'success', title: 'Đã hủy!', text: 'Đã hủy đơn hàng!', showConfirmButton: false, timer: 1500 });
            this.loadBookingDetail();
          },
          error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi hủy đơn: ' + (err.error?.message || 'Không rõ'), confirmButtonText: 'Đóng' })
        });
      }
    });
  }

  // ==========================================
  // XỬ LÝ ĐỔI PHÒNG (ROOM MOVE) Ở TAB 1
  // ==========================================
  changingRoomId: number | null = null;   
  selectedNewRoomId: number | null = null; 

  enableChangeRoom(currentRoomId: number, roomTypeId: number) {
    this.changingRoomId = currentRoomId;
    this.selectedNewRoomId = null;
    this.availableRooms = []; 
    
    this.partnerService.getAvailableRoomsByType(roomTypeId).subscribe({
      next: (res: any) => {
        this.availableRooms = res.data ? res.data : res;
        if (!this.availableRooms || this.availableRooms.length === 0) {
          Swal.fire({ icon: 'info', title: 'Thông báo', text: 'Hiện không có phòng Trống nào thuộc hạng phòng này để đổi!', confirmButtonText: 'Đóng' });
          this.cancelChangeRoom();
          return;
        }
        this.cdr.detectChanges(); 
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi tải danh sách phòng trống!', confirmButtonText: 'Đóng' });
        this.cancelChangeRoom();
      }
    });
  }
  cancelChangeRoom() { this.changingRoomId = null; this.selectedNewRoomId = null; }

  saveRoomChange() {
    if (!this.selectedNewRoomId) {
      Swal.fire({ icon: 'warning', title: 'Cảnh báo', text: 'Vui lòng chọn một phòng mới để đổi!', confirmButtonText: 'Đóng' });
      return;
    }

    const payload = { old_room_id: this.changingRoomId, new_room_id: this.selectedNewRoomId };
    this.bookingService.changeRoom(this.bookingId, payload).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Thành công!', text: '🔄 Đổi phòng thành công!', showConfirmButton: false, timer: 1500 });
        this.changingRoomId = null; this.selectedNewRoomId = null;
        this.loadBookingDetail();
      },
      error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi đổi phòng: ' + (err.error?.message || 'Không xác định'), confirmButtonText: 'Đóng' })
    });
  }

  // ==========================================
  // XỬ LÝ SỬA LIÊN HỆ & GHI CHÚ (TAB 1)
  // ==========================================
  isEditingNotes: boolean = false;
  editingPhone: string = '';
  editingSpecialRequests: string = '';

  enableEditNotes() {
    this.isEditingNotes = true;
    this.editingPhone = this.booking?.guest_phone || '';
    this.editingSpecialRequests = this.booking?.special_requests || '';
  }

  cancelEditNotes() { this.isEditingNotes = false; }

  saveNotes() {
    const payload = { guest_phone: this.editingPhone, special_requests: this.editingSpecialRequests };
    this.bookingService.updateBookingNotes(this.bookingId, payload).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Cập nhật Ghi chú & Liên hệ thành công!', showConfirmButton: false, timer: 1500 });
        this.isEditingNotes = false;
        this.loadBookingDetail();
      },
      error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi cập nhật: ' + (err.error?.message || 'Không xác định'), confirmButtonText: 'Đóng' })
    });
  }
  
  // ==========================================
  // CÁC BIẾN & HÀM CHO TAB 2 (DỊCH VỤ / MINIBAR)
  // ==========================================
  activeServiceTab: number = 1; 
  menuServices: any[] = [];
  menuMinibars: any[] = [];
  cartServices: any[] = [];
  cartMinibars: any[] = [];
  cartTotal: number = 0;

  switchTab(tab: 'checkin' | 'services' | 'checkout') {
    this.activeTab = tab;
    if (tab === 'services' || tab === 'checkout') {
      this.loadMenuAndCart();
    }  
  }

  loadMenuAndCart() {
    this.bookingService.getMenuAndCart(this.bookingId).subscribe({
      next: (res: any) => {
        this.menuServices = res.menu_services || [];
        this.menuMinibars = res.menu_minibars || [];
        this.cartServices = res.cart_services || [];
        this.cartMinibars = res.cart_minibars || [];
        this.calculateCartTotal();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.log('Lỗi tải menu:', err)
    });
  }

  calculateCartTotal() {
    let total = 0;
    this.cartServices.forEach(item => total += (Number(item.price_at_booking) * item.quantity));
    this.cartMinibars.forEach(item => total += (Number(item.price_at_booking) * item.quantity));
    this.cartTotal = total;

    const roomTotal = Number(this.booking?.total_amount || 0);
    // Cộng thêm tổng phụ thu vào đây để tính VAT
    const surchargeTotal = this.booking?.surcharges ? this.booking.surcharges.reduce((sum: number, item: any) => sum + Number(item.amount), 0) : 0;
    
    this.calculatedVat = (roomTotal + this.cartTotal + surchargeTotal) * 0.10; 
  }

  addToCart(item: any, type: number) {
    const payload = {
      [type === 1 ? 'service_id' : 'minibar_id']: item.id,
      quantity: 1, price: item.price 
    };

    const apiCall = type === 1 
      ? this.bookingService.addService(this.bookingId, payload)
      : this.bookingService.addMinibar(this.bookingId, payload);

    apiCall.subscribe({
      next: () => this.loadMenuAndCart(),
      error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi thêm món: ' + (err.error?.message || 'Không rõ'), confirmButtonText: 'Đóng' })
    });
  }

  removeFromCart(cartId: number) {
    Swal.fire({
      title: 'Xóa món?', text: 'Bạn có chắc chắn muốn xóa món này khỏi hóa đơn?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa bỏ', cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.removeExtraService(this.bookingId, cartId).subscribe({
          next: () => this.loadMenuAndCart(),
          error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi khi xóa món: ' + (err.error?.message || 'Không xác định'), confirmButtonText: 'Đóng' })
        });
      }
    });
  }

  changeQuantity(cartItem: any, change: number) {
    const newQuantity = cartItem.quantity + change;
    if (newQuantity <= 0) {
      this.removeFromCart(cartItem.id);
      return;
    }

    if (change > 0 && cartItem.service?.type === 2) {
      const stock = cartItem.service?.quantity ?? 0;
      if (newQuantity > stock) {
        Swal.fire({ icon: 'warning', title: 'Cảnh báo', text: `Không thể tăng! Trong kho chỉ còn tối đa ${stock} mặt hàng.`, confirmButtonText: 'Đóng' });
        return;
      }
    }

    const payload = { quantity: newQuantity, note: cartItem.note };
    this.bookingService.updateExtraService(this.bookingId, cartItem.id, payload).subscribe({
      next: () => this.loadMenuAndCart(),
      error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi cập nhật số lượng: ' + (err.error?.message || 'Không rõ'), confirmButtonText: 'Đóng' })
    });
  }

  saveNote(cartItem: any, event: any) {
    const newNote = event.target.value;
    const payload = { quantity: cartItem.quantity, note: newNote };
    this.bookingService.updateExtraService(this.bookingId, cartItem.id, payload).subscribe({
      next: () => { cartItem.note = newNote; },
      error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi lưu ghi chú: ' + (err.error?.message || 'Không rõ'), confirmButtonText: 'Đóng' })
    });
  }

  // ==========================================
  // XỬ LÝ THANH TOÁN, TRẢ PHÒNG & PHỤ THU (TAB 3)
  // ==========================================
  numberOfNights: number = 1;
  calculatedVat: number = 0;
// Biến cho phần Đền bù vật tư
  availableSupplies: any[] = [];
supplyForm: any = { supply_id: '', incident_type: 1, quantity: 1, actual_price: 0, note: '' };  availableSurcharges: any[] = [];
  surchargeForm: any = { surcharge_category_id: '', amount: '', note: '' };

  loadSurchargeCategories() {
    this.partnerService.getSurchargeCategories().subscribe({
      next: (res: any) => {
        this.availableSurcharges = res.data || res || [];
        this.cdr.detectChanges();
      }
    });
  }

  addBookingSurcharge() {
    if (!this.surchargeForm.surcharge_category_id || !this.surchargeForm.amount || this.surchargeForm.amount <= 0) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng chọn loại phụ thu và nhập số tiền hợp lệ!', confirmButtonText: 'Đóng' });
      return;
    }

    this.bookingService.addSurcharge(this.bookingId, this.surchargeForm).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã thêm khoản phụ thu!', showConfirmButton: false, timer: 1500 });
        this.surchargeForm = { surcharge_category_id: '', amount: '', note: '' }; // Reset form
        this.loadBookingDetail(); // Reload lại đơn hàng để hiện phụ thu vào hóa đơn
      },
      error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi thêm phụ thu', confirmButtonText: 'Đóng' })
    });
  }

  removeSurcharge(surchargeId: number) {
    Swal.fire({
      title: 'Xóa phụ thu?', text: 'Bạn có chắc chắn muốn xóa khoản phụ thu này khỏi hóa đơn?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa', cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.removeSurcharge(this.bookingId, surchargeId).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Đã xóa', text: 'Đã xóa khoản phụ thu.', showConfirmButton: false, timer: 1500 });
            this.loadBookingDetail();
          },
          error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi xóa phụ thu', confirmButtonText: 'Đóng' })
        });
      }
    });
  }

  processCheckOut() {
    Swal.fire({
      title: 'Xác nhận trả phòng?', text: 'Xác nhận khách đã thanh toán đầy đủ và tiến hành trả phòng?', icon: 'question',
      showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Thanh toán & Trả phòng', cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = { payment_method: this.selectedPaymentMethod };
        this.bookingService.checkOutBooking(this.bookingId, payload).subscribe({
          next: (res: any) => {
            Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Trả phòng thành công! Cảm ơn bạn.', showConfirmButton: false, timer: 1500 });
            this.loadBookingDetail(); 
          },
          error: (err: any) => {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi khi trả phòng: ' + (err.error?.message || 'Vui lòng kiểm tra lại.'), confirmButtonText: 'Đóng' });
          }
        });
      }
    });
  }

  printInvoice() { window.print(); }

  calculateNights() {
    if (!this.booking?.check_in || !this.booking?.check_out) {
      this.numberOfNights = 1; return;
    }
    const start = new Date(this.booking.check_in).getTime();
    const end = new Date(this.booking.check_out).getTime();
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    this.numberOfNights = diffDays > 0 ? diffDays : 1; 
  }
  
  // Getter tính tổng phụ thu để dùng ngoài HTML
  getSurchargeTotal(): number {
    if (!this.booking?.surcharges) return 0;
    return this.booking.surcharges.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
  }


  // ==========================================
  // QUẢN LÝ VẬT TƯ (SUPPLIES)
  // ==========================================
loadSupplies() {
    this.partnerService.getSupplies().subscribe({
      next: (res: any) => {
        const allSupplies = res.data || res || [];
        // LỌC: Chỉ lấy những vật tư có status == 1 (Đang áp dụng)
        this.availableSupplies = allSupplies.filter((item: any) => item.status == 1);
        this.cdr.detectChanges();
      }
    });
  }

addDamagedItem() {
    if (!this.supplyForm.supply_id || this.supplyForm.quantity <= 0) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng chọn vật tư và nhập số lượng hợp lệ!', confirmButtonText: 'Đóng' });
      return;
    }

    this.bookingService.addDamagedItem(this.bookingId, this.supplyForm).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã thêm phí đền bù!', showConfirmButton: false, timer: 1500 });
        this.supplyForm = { supply_id: '', quantity: 1, note: '' }; // Reset form
        this.loadBookingDetail(); 
      },
      error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi thêm vật tư đền bù', confirmButtonText: 'Đóng' })
    });
  }

  removeDamagedItem(itemId: number) {
    Swal.fire({
      title: 'Xóa phí đền bù?', text: 'Bạn có chắc muốn xóa khoản đền bù này khỏi hóa đơn?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa', cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.removeDamagedItem(this.bookingId, itemId).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Đã xóa', text: 'Đã xóa khoản đền bù.', showConfirmButton: false, timer: 1500 });
            this.loadBookingDetail();
          },
          error: (err: any) => Swal.fire({ icon: 'error', title: 'Lỗi', text: err.error?.message || 'Lỗi xóa vật tư', confirmButtonText: 'Đóng' })
        });
      }
    });
  }

getDamagedItemsTotal(): number {
    if (!this.booking?.supply_incidents) return 0;
    
    return this.booking.supply_incidents.reduce((sum: number, item: any) => {
      // actual_price lúc này chính là cục tiền tổng cuối cùng lễ tân gõ vào
      const finalPrice = item.actual_price || 0; 
      return sum + Number(finalPrice); // Không nhân với item.quantity nữa
    }, 0);
  }
  // Hàm tự động tính toán Giá thu đề xuất = Giá gốc * Số lượng
  calculateSuggestedPrice() {
    if (!this.supplyForm.supply_id) {
      this.supplyForm.actual_price = 0;
      return;
    }

  const selectedSupply = this.availableSupplies.find(
                          s => Number(s.id) === Number(this.supplyForm.supply_id));

  if (selectedSupply) {
      const basePrice = Number(selectedSupply.price_per_unit) || 0;
      const qty = Number(this.supplyForm.quantity) || 1;
      
      // Tự động điền Tổng tiền vào ô Giá thu
      this.supplyForm.actual_price = basePrice * qty;
    }
  }

  // Hẹn giờ đến trễ
  reportLateCheckIn() {
    Swal.fire({
      title: 'Khách hẹn đến trễ', text: 'Nhập giờ khách dự kiến tới (VD: 19:30):',
      input: 'text', inputPlaceholder: 'HH:MM', showCancelButton: true,
      inputValidator: (value) => {
        if (!value || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) return 'Vui lòng nhập đúng định dạng HH:MM';
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.updateEstimatedTime(this.bookingId, { estimated_arrival_time: result.value }).subscribe({
          next: () => { Swal.fire('Thành công', 'Đã lưu giờ đến trễ', 'success'); this.loadBookingDetail(); }
        });
      }
    });
  }

  // Hẹn giờ trả phòng trễ
  reportLateCheckOut() {
    Swal.fire({
      title: 'Khách xin trả phòng trễ', text: 'Nhập giờ khách dự kiến đi (VD: 15:00):',
      input: 'text', inputPlaceholder: 'HH:MM', showCancelButton: true,
      inputValidator: (value) => {
        if (!value || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) return 'Vui lòng nhập đúng định dạng HH:MM';
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.updateEstimatedTime(this.bookingId, { estimated_departure_time: result.value }).subscribe({
          next: () => { Swal.fire('Thành công', 'Đã lưu giờ trả phòng trễ', 'success'); this.loadBookingDetail(); }
        });
      }
    });
  }

  // Xử lý No-Show
  processNoShow() {
    Swal.fire({
      title: 'Khách KHÔNG ĐẾN (No-Show)?', text: 'Đơn hàng sẽ bị đóng và phòng sẽ được giải phóng lập tức.',
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#1e293b', confirmButtonText: 'Đồng ý', cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.markAsNoShow(this.bookingId).subscribe({
          next: () => { Swal.fire('Đã gạch sổ!', '', 'success'); this.loadBookingDetail(); }
        });
      }
    });
  }
}