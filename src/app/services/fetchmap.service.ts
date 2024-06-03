import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // No need to import HttpClientModule here

@Injectable({
  providedIn: 'root'
})
export class FetchmapService {
  getData() {
    throw new Error('Method not implemented.');
  }

}
