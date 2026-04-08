import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../services/hotel'; 

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class OverviewComponent implements OnInit {
  stats: any = {
    new_bookings: 0,
    total_rooms: 0,
    revenue: 0
  };

  constructor(
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.hotelService.getDashboardStats().subscribe({
      next: (res: any) => {
        this.stats = res;
        this.cdr.detectChanges(); // Ép giao diện vẽ lại ngay lập tức
      },
      error: (err: any) => console.log(err)
    });
  }
}