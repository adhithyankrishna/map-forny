import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule ,
    MatIcon,
    MatSnackBarModule,
    

    
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  hide:boolean = true;
  constructor(
    private http: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar 
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  save(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.http.get(`http://localhost:8080/new/login?email=${email}&password=${password}`).subscribe((res: any) => {
        console.log(res);
        if(res.role ==="admin"){
          localStorage.setItem("role",res.role);
        }
        if (res.token) {
          localStorage.setItem("token", res.token);
          this.router.navigate(["/map"]);
        }
      },(error:any)=>{
        if (error.error === "User not found"){
          this.openSnackBar("User not found");
        }
        if (error.error === "Invalid credentials"){
          console.log("serror",error.error);
          this.openSnackBar("Password incorrect")

        }
        console.log(error);

      });
    }
  }

  openSnackBar(message: string): void {
    const config = new MatSnackBarConfig();
    config.verticalPosition = 'top';
    config.panelClass = ['custom-snackbar'];
    this.snackBar.open(message, 'Close', config);
  }


  gosign(){
    this.router.navigate(["/signup"]);
  }
}
