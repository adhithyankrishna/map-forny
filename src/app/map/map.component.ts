import { Component, OnInit } from '@angular/core';
import { FetchmapService } from '../services/fetchmap.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddreviewComponent } from '../addreview/addreview.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../services/data.service';
import { CanvaService } from '../services/canva.service';
import {MatIconModule} from '@angular/material/icon';





@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  imports: [HttpClientModule, FormsModule, CommonModule, MatSnackBarModule,MatIconModule],
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  numRow!: number;
  numColm!: number;
  gridData: any;
  drawing = false;
  placeNmae: String = "";
  isPath = false;
  isBuilding = false;
  object: any[] = [];
  filename = 'large_map';
  da: data;
  saveName:any;
  role: String = "";
  mapper:any;
  reviews: any[] = [];

  constructor(private fetchdata: FetchmapService, private http: HttpClient, private router: Router,
    private snackBar: MatSnackBar,
    private dataService: DataService,
    private dialog: MatDialog,
    private canvaService: CanvaService
  ) {
    this.da = new data();
  }

  ngOnInit(): void {
    this.numRow = 40;
    this.numColm = 30;
    this.role = localStorage.getItem('role') || "";
    this.initiateData();

  }

  initiateData(): void {
    this.http.get("http://localhost:8080/new/FindMap?filename=large_map").subscribe(
      (data: any) => {
        console.log(data);
        this.mapper = data;
        this.gridData = data.data;
        this.numRow = data.numRows;
        this.numColm = data.numCols;
        this.draw();
      },
      (error: any) => {
        alert("there is network issue");
      }
    );
  }

  draw(): void {
    const gridContainer = document.querySelector(".grid") as HTMLElement;
    gridContainer.innerHTML = "";

    for (let i = 0; i < this.numRow; i++) {
      for (let j = 0; j < this.numColm; j++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.setAttribute('data-row', i.toString());
        cell.setAttribute('data-col', j.toString());
        cell.setAttribute('object', '');
        cell.style.width = "20px";
        cell.style.height = "20px";
        cell.style.border = "1px solid black";

        if (this.gridData.path) {
          for (let pathName in this.gridData.path) {
            if (this.gridData.path.hasOwnProperty(pathName)) {
              let pathCoordinates = this.gridData.path[pathName];
              for (let k = 0; k < pathCoordinates.length; k++) {
                let coordinate = pathCoordinates[k];
                let x = parseInt(coordinate[0]);
                let y = parseInt(coordinate[1]);
                if (x === i && y === j) {
                  cell.style.backgroundColor = "black";
                  cell.setAttribute('object', pathName);
                }
              }
            }
          }
        }

        if (this.gridData.building) {
          for (let buildingName in this.gridData.building) {
            if (this.gridData.building.hasOwnProperty(buildingName)) {
              let buildingCoordinates = this.gridData.building[buildingName];
              for (let k = 0; k < buildingCoordinates.length; k++) {
                let coordinate = buildingCoordinates[k];
                let x = parseInt(coordinate[0]);
                let y = parseInt(coordinate[1]);
                if (x === i && y === j) {
                  cell.style.backgroundColor = "#d16f32";
                  cell.setAttribute('object', buildingName);
                }
              }
            }
          }
        }

        cell.addEventListener("mousedown", (event) => this.onmousedown(event));
        cell.addEventListener("mouseup", (event) => this.onmouseup(event));
        cell.addEventListener("contextmenu", (event) => this.onRightClick(event));
        cell.addEventListener("mouseenter", (event) => this.onmouseenter(event));
        // cell.addEventListener("mouseover", (event) => this.onmousehover(event));
        // cell.addEventListener("dblclick", (event) => this.leftclick(event)); // Corrected event name
        gridContainer.appendChild(cell);
      }

      const lineBreak = document.createElement("br");
      gridContainer.appendChild(lineBreak);
    }
  }

  onmousedown(event: any): void {
    let cell = event.target;
    let obj = cell.getAttribute("object");
    if (obj !== '') {
      this.placeNmae = obj;
      this.leftclick(obj);
    }
    else {
      this.drawing = true;
      this.object = [];
      this.draw();
      this.drawLine(event.target);
    }
  }

  onmouseup(event: any): void {
    console.log("false");
    this.drawing = false;
  }

  onmouseenter(event: any): void {
    if (this.drawing) {
      this.drawLine(event.target);
    }
  }


  drawLine(cell: HTMLElement): void {
    if (this.drawing) {
      const row = cell.getAttribute('data-row');
      const col = cell.getAttribute('data-col');
      const obj = cell.getAttribute("object");
      if (obj === "") {
        if (this.isPath) {
          cell.style.backgroundColor = "black";
          this.object.push([row, col]);
        } else if (this.isBuilding) {
          cell.style.backgroundColor = "brown";
          this.object.push([row, col]);
        }
      }
    }


  }

  getStarArray(rating: String): number[] {

    return Array(Number(rating)).fill(0);
  }

  toggleBuilding(): void {
    this.isBuilding = !this.isBuilding;
    const btn = document.getElementById("building") as HTMLElement;

  }

  togglePath(): void {
    this.isPath = !this.isPath;
    const btn = document.getElementById("path") as HTMLElement;

  }

  logout(): void {
    localStorage.setItem("token", "");
    localStorage.setItem("role", "");
    this.router.navigate(["/login"]);
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    console.log('Right-clicked!');
    alert("Right-clicked!");
  }

  findPath(): void {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': '' + localStorage.getItem('token')
      })
    };

    this.http.post(`http://localhost:8080/new/server?mapName=large_map&source=${this.da.source}&dest=${this.da.destination}`, {}, httpOptions).subscribe((res: any) => {
      if (res) {
        this.gridData = res;
        this.rerender();
      } else {
        console.log("error");
      }
    }, (error: any) => {
      console.log(error);
      if (error.error === "java.lang.IllegalArgumentException: There no path between source and destination ") {
        this.openSnackBar("There is not path")
      }
    });
  }

  rerender(): void {
    for (let i = 0; i < this.gridData.length; i++) {
      for (let j = 0; j < this.gridData[0].length; j++) {
        if (this.gridData[i][j] === -3) {
          let cell = document.querySelector(`.grid-cell[data-row="${i}"][data-col="${j}"]`) as HTMLElement;
          if (cell) {
            cell.style.backgroundColor = "yellow";
          }
        }
      }
    }
  }

  leftclick(object: String): void {
    // Check if the token exists in local storage
    const token = localStorage.getItem('token');
    console.log("res");
    if (token) {
      // Set the authorization headers with the token
      const headers = new HttpHeaders({
        'Authorization': token
      });

      // Make the HTTP GET request with headers
      this.http.get(`http://localhost:8080/new/GetReviewPlace?placeId=${object}`, { headers: headers })
        .subscribe(
          (res: any) => {
            if (res) {

             

              this.reviews = res;
              console.log(this.reviews);
            } else {
              console.log("error");
            }
          },
          (error: any) => {
            console.error('Error fetching review place data', error);
          }
        );
    } else {
      console.error('No token found in local storage');
    }
  }

  openReviewDialog(): void {
    const dialogRef = this.dialog.open(AddreviewComponent, {
      width: '700px',
      panelClass: 'custom-dialog-container',
      data: { placeName: this.placeNmae }
    });

    // Apply blur to the map container
    const mapContainer = document.querySelector('.map-container') as HTMLElement;
    if (mapContainer) {
      mapContainer.classList.add('blurred');
    }

    dialogRef.afterClosed().subscribe(result => {

      if (mapContainer) {
        mapContainer.classList.remove('blurred');
      }
    });



  }


  send(){
    let uniqueObject = [...new Set(this.object.map(item => JSON.stringify(item)))].map(item => JSON.parse(item));
    console.log(uniqueObject);
    console.log(this.saveName);
    if (this.isPath) {
      if (!this.mapper.data.path) {
          this.mapper.data["path"] = {};
      }
      this.mapper.data.path[this.saveName] = uniqueObject;
  } else if (this.isBuilding) {
      if (!this.mapper.data.building) {
          this.mapper.data["building"] = {};
      }
      this.mapper.data.building[this.saveName] = uniqueObject;
  }

     this.http.post(`http://localhost:8080/new/saveData`,this.mapper).subscribe((res:any)=>{
          console.log("success");
          this.initiateData();
     },(error:any)=>{
       console.log(error);
     })
    
  }

  navigateAlbum() {
    let sample = [];
    for (let rev of this.reviews) {
      sample.push(rev.imagePath);
    }
    this.dataService.setData(sample);
    console.log(sample);
    this.router.navigate(['/album'])
  }

  navigateProfile(){
    this.router.navigate(['/profile'])
  }

  openSnackBar(message: string): void {
    const config = new MatSnackBarConfig();
    config.verticalPosition = 'top';
    config.panelClass = ['custom-snackbar'];
    this.snackBar.open(message, 'Close', config);
  }





}

export class data {
  source: string = '';
  destination: string = '';
}
