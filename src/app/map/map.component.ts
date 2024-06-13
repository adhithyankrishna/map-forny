import { Component, OnInit } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  imports: [HttpClientModule, FormsModule, CommonModule, MatSnackBarModule, MatIconModule, ScrollingModule, MatProgressSpinnerModule],
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
  avgergereview: string | null;
  mapper: any;
  reviews: any[] = [];
  mapData: any;
  isPanel = false;
  isSearch = false;
  unit: number | null;
  sug = [];
  laskClick:string = "";
  sd = false;
  ss = false;

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
    this.unit = null;
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
        console.log(this.gridData);
        this.numRow = this.mapper.numRows;
        this.numColm = this.mapper.numCols;
        this.draw();
        this.unit =null;
      },
      (error: any) => {
        alert("there is network issue");
      }
    );
  }

  togglePanel() {
    this.isPanel = !this.isPanel;
    if (!this.togglePanel) {
      this.avgergereview = null;
      this.reviews = [];
    }
  }

  toggleSearch() {
    this.isSearch = !this.isSearch;
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

  onmousedown(event: any): void {
    let cell = event.target;
    let obj = cell.getAttribute("object");
    if (obj !== '') {
      this.placeNmae = obj;
      this.leftclick(obj);
      if (!this.isPanel) {
        this.togglePanel();
      }
      
    } else {
     
    }
    if (this.isPanel && obj === '') {
      this.togglePanel();
    }

    this.laskClick = obj;
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

  onRightClick(event: any): void {
    event.preventDefault();
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
      }
    }, (error: any) => {
      if (error.error === "java.lang.IllegalArgumentException: There no path between source and destination ") {
        this.openSnackBar("There is not path")
      }
    });
  }

  rerender(): void {
    this.unit = 0;
    for (let i = 0; i < this.gridData.length; i++) {
      for (let j = 0; j < this.gridData[0].length; j++) {
        if (this.gridData[i][j] === -3) {
          this.unit++;
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
            }
          },
          (error: any) => {
            console.log(error);
          }

        );


    }
  }

  getsource() {
    if (this.da.source === '') {
      this.sug = [];
      this.ss = false;
    }
    this.ss = true;
    //if (this.da.source.length>=3){
    this.getSugg(this.da.source);
    //}
  }

  getDest() {
    if (this.da.destination === '') {
      this.sug = [];
      this.sd = false;
    }
    this.sd = true;

    this.getSugg(this.da.destination);
  }

  getSugg(place: string) {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });
      this.http.get(`http://localhost:8080/new/getSuggestion?query=${place}`, { headers: headers })
        .subscribe(
          (res: any) => {
            this.sug = res;
            console.log(res);
          },
          (error: any) => {
            console.log(error);
          }

        );
    }

  }

  changeSource(value: string) {
    this.da.source = value;
    this.sug = [];
    this.ss = false;
  }


  changeDest(value: string) {
    this.da.destination = value;
    this.sd = false;
    this.sug = [];
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

  EnterKey(event: any) {
    if (event.key === "Enter") {
      this.findPath();
    }
  }

  navigateAlbum() {
    let sample = [];
    for (let rev of this.reviews) {
      sample.push(rev.imagePath);
    }
    this.dataService.setData(sample);
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
