// src/app/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string | null = null;
  headers: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('token');
    }
  }

  login(): boolean {
    return !!this.token;
  }

  isAdmin(): Observable<boolean> {
    const token = localStorage.getItem('token');
    this.headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get("http://localhost:8080/new/getUser", { headers: this.headers }).pipe(
      map((res: any) => res[0].role && res[0].role === 'admin'),
      catchError((error: any) => {
        console.error(error);
        return of(false);
      })
    );
  }
}
