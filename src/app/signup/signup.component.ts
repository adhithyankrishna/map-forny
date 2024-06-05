import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Application } from '@splinetool/runtime';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  passwordVisible: boolean = false;
  constructor(private http:HttpClient,
    private router: Router,
    private snackBar: MatSnackBar 
  ){}

  ngOnInit(): void {
    const canvas = document.getElementById('canvas3d') as HTMLCanvasElement;
    const app = new Application(canvas);
    app.load('https://prod.spline.design/PRhgCGEAirPRF6IB/scene.splinecode');
  }

  onSubmit() {
    console.log('Name:', this.name);
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    if (this.name === null || this.email === null || this.password === null ){
      this.openSnackBar("Enter all detail");
    }

    this.http.get(`http://localhost:8080/new/SaveUser?name=${this.name}&email=${this.email}&password=${this.password}`).subscribe((res:any)=>{
      if (res.message === 'User saved successfully'){
        this.router.navigate(['/login']);
       
      }
      console.log(res);
    },(error:any)=>{
      console.log(error.error);
      if (error.error["error"]=== 'Duplicate user'){
        this.openSnackBar("User already found try to login")
      }
      if (error.error["error"] === 'Internal error java.lang.IllegalArgumentException: Password should be valid'){
        this.openSnackBar("Enter valid password");
      }
      if (error.error["error"] === 'Internal error java.lang.IllegalArgumentException: Email should be valid'){
        this.openSnackBar("Enter Valid email");
      }
    })

    
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  openSnackBar(message: string): void {
    const config = new MatSnackBarConfig();
    config.verticalPosition = 'top';
    config.panelClass = ['custom-snackbar'];
    this.snackBar.open(message, 'Close', config);
  }
}
