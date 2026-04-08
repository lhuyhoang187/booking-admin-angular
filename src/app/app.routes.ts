import { Routes } from '@angular/router';

// Import các Components
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { OverviewComponent } from './components/overview/overview';
import { HotelProfileComponent } from './components/hotel-profile/hotel-profile';
import { RoomTypesComponent } from './components/room-types/room-types';
import { BookingsComponent } from './components/bookings/bookings';

// Import Guard bảo vệ route (Nếu bạn đã tạo auth-guard)
// import { AuthGuard } from './guards/auth-guard'; 

export const routes: Routes = [
  // Mặc định khi vào web sẽ chuyển hướng đến trang Đăng nhập
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Các trang không cần đăng nhập
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Trang Dashboard (Có thể bọc AuthGuard ở đây để bảo vệ)
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    // canActivate: [AuthGuard], // Bỏ comment dòng này nếu bạn muốn bật bảo mật đăng nhập
    children: [
      // Mặc định vào dashboard sẽ hiển thị trang Tổng quan
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      
      // Các trang con nằm bên trong Dashboard
      { path: 'overview', component: OverviewComponent },
      { path: 'hotel', component: HotelProfileComponent },
      { path: 'rooms', component: RoomTypesComponent },
      { path: 'bookings', component: BookingsComponent }
    ]
  },

  // Đường dẫn "cứu thua" (Wildcard route): Nếu gõ sai link sẽ tự động về login
  { path: '**', redirectTo: 'login' }
];