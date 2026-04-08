import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerData = {
    full_name: '',
    email: '',
    password: '',
    phone: ''
  };
  
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.registerPartner(this.registerData).subscribe({
      next: (res: any) => { // <-- Thêm : any vào đây
        alert('Đăng ký thành công! Hãy đăng nhập.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => { // <-- Thêm : any vào đây
        alert('Đăng ký thất bại! Vui lòng thử lại.');
      }
    });
  }
}