import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule],
})
export class ProfileComponent implements OnInit {
  hist: any;
  profile: any;
  review: any;
  panelOpenState = false;
  headers: any;

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    this.headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toDateString();
  }

  getStarArray(rating: String): number[] {
    return Array(Number(rating)).fill(0);
  }

  logout(): void {
    localStorage.setItem("token", "");
    localStorage.setItem("role", "");
    this.router.navigate(["/login"]);
  }

  deleteHistory(index: number, time: String): void {
    this.http.post(`http://localhost:8080/new/delteHistory?time=${time}`, null, { headers: this.headers }).subscribe(
      (res: any) => {
        this.hist.splice(index, 1);
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  deleteReview(index: number, id: String): void {
    this.http.post(`http://localhost:8080/new/deleteReview?id=${id}`, null, { headers: this.headers }).subscribe(
      (res: any) => {
        this.review.splice(index, 1);
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  ngOnInit(): void {
    
    this.http.get("http://localhost:8080/new/GetReviewEmail", { headers: this.headers }).subscribe(
      (res: any) => {
        this.review = res;
      },
      (error: any) => {
        console.error(error);
      }
    );
    
    this.http.get("http://localhost:8080/new/getUser", { headers: this.headers }).subscribe(
      (res: any) => {
        this.profile = res[0];
        console.log(this.profile);
      },
      (error: any) => {
        console.error(error);
      }
    );
  
    this.http.get("http://localhost:8080/new/getHistory", { headers: this.headers }).subscribe(
      (res: any) => {
        this.hist = res;
        console.log(res);
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  adminpage() {
    this.router.navigate(['/admin']);
  }
}
