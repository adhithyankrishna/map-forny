import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddreviewComponent } from '../addreview/addreview.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './admingrid.component.html',
  imports: [HttpClientModule, FormsModule, CommonModule, MatSnackBarModule, MatIconModule, ScrollingModule],
  styleUrls: ['./admingrid.component.css']
})
export class AdmingridComponent implements OnInit {
  numRow!: number;
  numColm!: number;
  isDelete = false;
  gridData: any;
  drawing = false;
  placeNmae: string = "";
  isPath = false;
  isBuilding = false;
  object: any[] = [];
  filename = 'large_map';
  da: data;
  saveName: any;
  role: String = "";
  headers:any;
  isSave = false;

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
    const token = localStorage.getItem('token');
    this.headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

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
        console.log(this.mapper);
        this.numRow = this.mapper.numRows;
        this.numColm = this.mapper.numCols;
        this.draw();
      },
      (error: any) => {
        alert("there is network issue");
      }
    );
  }



  draw(): void {
    const gridContainer = document.querySelector(".grid") as HTMLElement;
    const overlayCanvas = document.querySelector(".overlay-canvas") as HTMLCanvasElement;
    const ctx = overlayCanvas.getContext("2d");

    gridContainer.innerHTML = "";
    overlayCanvas.width = gridContainer.clientWidth;
    overlayCanvas.height = gridContainer.clientHeight;

    const cellWidth = 22;
    const cellHeight = 22;

    const drawBuilding = (buildingName: string, coordinates: number[][]) => {
      if (ctx) {
        // Draw the building cells
        ctx.fillStyle = "#b59957";
        coordinates.forEach(coordinate => {
          const x = coordinate[1] * cellWidth;
          const y = coordinate[0] * cellHeight;
          ctx.fillRect(x, y, cellWidth, cellHeight);
        });

        // Calculate the centroid of the building
        const xCoords = coordinates.map(c => c[1] * cellWidth + cellWidth / 2);
        const yCoords = coordinates.map(c => c[0] * cellHeight + cellHeight / 2);
        const centroidX = xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length;
        const centroidY = yCoords.reduce((sum, y) => sum + y, 0) / yCoords.length;


        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(buildingName, centroidX, centroidY);
      }
    };

    for (let i = 0; i < this.numRow; i++) {
      for (let j = 0; j < this.numColm; j++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.setAttribute('data-row', i.toString());
        cell.setAttribute('data-col', j.toString());
        cell.setAttribute('object', '');
        cell.style.width = `${cellWidth}px`;
        cell.style.height = `${cellHeight}px`;
        cell.style.border = "0.5px solid black";
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

    if (this.gridData.building) {
      for (let buildingName in this.gridData.building) {
        if (this.gridData.building.hasOwnProperty(buildingName)) {
          drawBuilding(buildingName, this.gridData.building[buildingName]);
        }
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  enterkey(event:any){
    if(this.object.length>0 && event.key ==='Enter'){
      this.isSave = !this.isSave;
    }
  }

  onmousedown(event: any): void {
    let cell = event.target;
    let obj = cell.getAttribute("object");
    if (obj !== '') {
      this.placeNmae = obj;
      console.log(this.placeNmae);
      if (this.isDelete){
        this.deleteBlock();
      }

    } else {
      this.drawing = true;
      this.object = [];
      this.draw();
      this.drawLine(event.target);
    }

  }

  deleteBlock(){
    delete this.mapper.data.building[this.placeNmae];
    console.log(this.mapper);
    this.http.post(`http://localhost:8080/new/saveData`, this.mapper,{ headers: this.headers }).subscribe((res: any) => {
      console.log(res);
      
      this.initiateData();
    }, (error: any) => {
      console.log("error",error);

    })
    
  }

  toggleDelete(){
    this.isDelete = !this.isDelete;
  }

  toggleSave(){
    if (this.object.length>0)
    this.isSave = !this.isSave;
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



  toggleBuilding(): void {
    this.isBuilding = !this.isBuilding;
  }

  togglePath(): void {
    this.isPath = !this.isPath;
  }


  togglePanel() {
    this.isPanel = !this.isPanel;
  }

  onRightClick(event: any): void {
    event.preventDefault();
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

  resetObject(){
    this.object = [];
    this.draw();
  }

  send() {
    let uniqueObject = [...new Set(this.object.map(item => JSON.stringify(item)))].map(item => JSON.parse(item));
    this.mapper["numRows"] = 60;
    this.mapper["numCols"] = 150;
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

    this.http.post(`http://localhost:8080/new/saveData`, this.mapper,{ headers: this.headers }).subscribe((res: any) => {
      console.log(res);
      this.isSave = !this.isSave;
      this.object = [];
      this.initiateData();
    }, (error: any) => {
      console.log("error",error);

    })
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
