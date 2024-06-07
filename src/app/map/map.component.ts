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
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  imports: [HttpClientModule, FormsModule, CommonModule, MatSnackBarModule, MatIconModule,ScrollingModule],
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
  saveName: any;
  role: String = "";
  avgergereview : string|null;
  mapper: any;
  reviews: any[] = [];
  mapData: any;
  isPanel = false;
  isSearch = false;

  shape: any[] = [];

  constructor(
   
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private dataService: DataService,
    private dialog: MatDialog,
  ) {
    this.da = new data();
    this.avgergereview = null;
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
        this.mapper = data;
        this.gridData = data.data;
        this.numRow =  40;
        this.numColm = 40;
        this.draw();
      },
      (error: any) => {
        alert("there is network issue");
      }
    );
  }

  togglePanel(){
    this.isPanel = !this.isPanel;
    if (!this.togglePanel){
      this.avgergereview  = null;
      this.reviews = [];
    }
  }

  toggleSearch(){
    this.isSearch = !this.isSearch;
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
        cell.style.width = "22px";
        cell.style.height = "22px";
        cell.style.border = "0px solid black";
        cell.style.outline = "none";
        cell.style.marginTop = '0';
        cell.style.boxSizing = 'border-box';
        
        if (this.gridData.path) {
          for (let pathName in this.gridData.path) {
            if (this.gridData.path.hasOwnProperty(pathName)) {
              let pathCoordinates = this.gridData.path[pathName];
              for (let k = 0; k < pathCoordinates.length; k++) {
                let coordinate = pathCoordinates[k];
                let x = parseInt(coordinate[0]);
                let y = parseInt(coordinate[1]);
                if (x === i && y === j) {
                  cell.style.backgroundColor = "#4a4741";
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
                  cell.style.backgroundColor = "#cfa865";
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
        gridContainer.appendChild(cell);
      }
    }
  }

  onmousedown(event: any): void {
    let cell = event.target;
    let obj = cell.getAttribute("object");
    if (obj !== '') {
      this.placeNmae = obj;
      this.leftclick(obj);
      this.togglePanel();
    } else {
      this.drawing = true;
      this.object = [];
      this.draw();
      this.drawLine(event.target);
    }
    if (this.isPanel && obj ===''){
      this.togglePanel();
    }
  }

  onmouseup(event: any): void {
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
  }

  togglePath(): void {
    this.isPath = !this.isPath;
  }

  logout(): void {
    localStorage.setItem("token", "");
    localStorage.setItem("role", "");
    this.router.navigate(["/login"]);
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault();
  //  console.log('Right-clicked!');
    alert("Right-clicked!");
  }

  findPath(): void {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': '' + localStorage.getItem('token')
      })
    };
    this.initiateData();

    this.http.post(`http://localhost:8080/new/server?mapName=large_map&source=${this.da.source}&dest=${this.da.destination}`, {}, httpOptions).subscribe((res: any) => {
      if (res) {
        this.gridData = res;
        this.rerender();
      } else {
      //  console.log("error");
      }
    }, (error: any) => {
     // console.log(error);
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
    const token = localStorage.getItem('token');
   // console.log("res");
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });

      this.http.get(`http://localhost:8080/new/GetReviewPlace?placeId=${object}`, { headers: headers })
        .subscribe(
          (res: any) => {
            if (res) {
              this.reviews = res[0].data;
              this.avgergereview = res[1].avg;
              console.log(this.reviews);
            } else {
              //console.log("error");
            }
          },
          (error: any) => {
            //console.log(error);
          }
        );
    } else {
     
    }
  }

  openReviewDialog(): void {
    const dialogRef = this.dialog.open(AddreviewComponent, {
      width: '700px',
      panelClass: 'custom-dialog-container',
      data: { placeName: this.placeNmae }
    });

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

  send() {
    let uniqueObject = [...new Set(this.object.map(item => JSON.stringify(item)))].map(item => JSON.parse(item));
  
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

    this.http.post(`http://localhost:8080/new/saveData`, this.mapper).subscribe((res: any) => {
    
      this.initiateData();
    }, (error: any) => {
      
    })
  }

  navigateAlbum() {
    let sample = [];
    for (let rev of this.reviews) {
      sample.push(rev.imagePath);
    }
    this.dataService.setData(sample);
   // console.log(sample);
    this.router.navigate(['/album'])
  }

  navigateProfile() {
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
