import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './album.component.html',
  styleUrl: './album.component.css'
})
export class AlbumComponent {
  data:any;
  main:any;
  constructor(private dataservice:DataService){
    this.data = dataservice.getData();
    this.main = this.data[0];

  }

  change(image:String){
    this.main = image;
  }

}
