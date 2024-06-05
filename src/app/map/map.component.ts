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

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  imports: [HttpClientModule, FormsModule, CommonModule, MatSnackBarModule, MatIconModule],
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
  mapper: any;
  reviews: any[] = [];
  mapData: any;
  private zoomLevel: number = 1;
  private offset: { x: number, y: number };
  private panStart: { x: number, y: number } | null = null;

  shape: any[] = [];

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private startX!: number;
  private startY!: number;
  private endX!: number;
  private endY!: number;

  constructor(
    private fetchdata: FetchmapService,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private dataService: DataService,
    private dialog: MatDialog,
    private canvaService: CanvaService,
  ) {
    this.da = new data();
    this.offset = { x: 0, y: 0 };
  }

  ngOnInit(): void {
    this.numRow = 40;
    this.numColm = 30;
    this.role = localStorage.getItem('role') || "";
    this.initiateData();

    this.canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
    this.canvas.addEventListener('mousedown', this.onCanvasMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onCanvasMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onCanvasMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onCanvasMouseUp.bind(this));

    this.http.get('assets/data.json').subscribe((res: any) => {
      this.mapData = res;
      this.initdrawcanava();
    });
  }

  initiateData(): void {
    this.http.get("http://localhost:8080/new/FindMap?filename=large_map").subscribe(
      (data: any) => {
       // console.log(data);
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
    } else {
      this.drawing = true;
      this.object = [];
      this.draw();
      this.drawLine(event.target);
    }
  }

  onmouseup(event: any): void {
   // console.log("false");
    this.drawing = false;
    this.panStart = null;
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
        'Authorization': token
      });

      this.http.get(`http://localhost:8080/new/GetReviewPlace?placeId=${object}`, { headers: headers })
        .subscribe(
          (res: any) => {
            if (res) {
              this.reviews = res;
             // console.log(this.reviews);
            } else {
              //console.log("error");
            }
          },
          (error: any) => {
           // console.error('Error fetching review place data', error);
          }
        );
    } else {
      //console.error('No token found in local storage');
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
   // console.log(uniqueObject);
   // console.log(this.saveName);
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
    //  console.log("success");
      this.initiateData();
    }, (error: any) => {
      //console.log(error);
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

  initdrawcanava() {
    let fet = this.mapData.features;
    for (let i = 0; i < fet.length; i++) {
      let obj = this.mapData.features[i];
      if (obj.geometry["type"] === "Polygon") {
       
        for (let i  = 0;i<obj.geometry["coordinates"].length;i++){
          this.shape = obj.geometry["coordinates"][i];
          this.drawOnCanvas(obj.properties["name"]);
          this.drawPathOncanva();

        }
      }
      if (obj.geometry["type"] === "LineString") {
        this.shape = obj.geometry["coordinates"];
        this.drawPathOncanva();
      }
    }
  }
  onMouseCanavaClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.ctx.fillStyle = 'blue';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 2, 0, Math.PI * 2);
    this.ctx.fill();
   // console.log(this.shape);
   // console.log(event.clientX+" "+event.clientY+" "+rect.top+" "+rect.left);
    //console.log(x+" "+y);
    this.shape.push([x, y]);
    if (this.isBuilding) {
      if (this.shape.length >= 2 && this.isStartingPointReached()) {
        this.drawOnCanvas("");
      }
    } else {
      this.drawPathOncanva();
    }
  }
  isStartingPointReached(): boolean {
    if (this.shape.length < 2) {
      return false;
    }
    const startX = this.shape[0][0];
    const startY = this.shape[0][1];
    const currentX = this.shape[this.shape.length - 1][0];
    const currentY = this.shape[this.shape.length - 1][1];
    const distance = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
    const threshold = 10;
    return distance <= threshold;
  }

  drawOnCanvas(name: string): void {
    if (this.shape.length < 2) {
      return;
    }
    this.ctx.save();
    this.ctx.strokeStyle = 'blue';
    this.ctx.lineWidth = 0.1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.shape[0][0], this.shape[0][1]);
    for (let i = 1; i < this.shape.length; i++) {
      this.ctx.lineTo(this.shape[i][0], this.shape[i][1]);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = "red";
    this.ctx.fill();
    this.ctx.stroke();
    //console.log(this.shape);
    this.drawTextInShape(name);
    this.shape = [];
    this.ctx.restore();
  }

  drawTextInShape(text: string): void {
    const minX = Math.min(...this.shape.map(point => point[0]));
    const maxX = Math.max(...this.shape.map(point => point[0]));
    const minY = Math.min(...this.shape.map(point => point[1]));
    const maxY = Math.max(...this.shape.map(point => point[1]));

    const width = maxX - minX;
    const height = maxY - minY;

    let fontSize = Math.min(width / text.length, height / 2);
   // if (fontSize < 10) fontSize = 10;

    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    this.ctx.fillText(text, centerX, centerY);
  }

  drawPathOncanva() {
    this.ctx.save();
    this.ctx.strokeStyle = '#474234';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    //this.ctx.moveTo(this.shape[0][0], this.shape[0][1]);
    for (let i = 1; i < this.shape.length; i++) {
      //console.log(i);
      this.ctx.lineTo(this.shape[i][0], this.shape[i][1]);
    }
    this.ctx.stroke();
   // console.log(this.shape);
    this.ctx.restore();
  }

 
  onMouseWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoomLevel *= zoomFactor;
    this.offset.x = x - (x - this.offset.x) * zoomFactor;
    this.offset.y = y - (y - this.offset.y) * zoomFactor;
    this.redrawCanvas();
  }

 
  onCanvasMouseDown(event: MouseEvent): void {
    this.panStart = { x: event.clientX, y: event.clientY };
  }

  
  onCanvasMouseMove(event: MouseEvent): void {
    if (this.panStart) {
      const dx = event.clientX - this.panStart.x;
      const dy = event.clientY - this.panStart.y;
      this.offset.x += dx;
      this.offset.y += dy;
      this.panStart = { x: event.clientX, y: event.clientY };
      this.redrawCanvas();
    }
  }

 
  onCanvasMouseUp(event: MouseEvent): void {
    this.panStart = null;
  }

  redrawCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.zoomLevel, this.zoomLevel);
    this.initdrawcanava();
    this.ctx.restore();
  }

  openShape(): void {
    const dialogRef = this.dialog.open(AddreviewComponent, {
      width: '700px',
      panelClass: 'custom-dialog-container',
      data: { placeName: this.placeNmae }
    });
  }
}

export class data {
  source: string = '';
  destination: string = '';
}
