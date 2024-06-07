import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AddshapeComponent } from '../addshape/addshape.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [HttpClientModule,CommonModule,MatIconModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  mapData: any;
  private zoomLevel: number = 1;
  private offset!: { x: number; y: number; } ;
  private panStart: { x: number, y: number } | null = null;
  sidePanel = false;
  shape: any[] = [];
  newshape:any[] = [];
  isBuilding =false;
  isPath = false;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private startX!: number;
  private startY!: number;
  private endX!: number;
  private endY!: number;


  constructor(private http: HttpClient,
    private dialog: MatDialog,
  ) {
    this.offset = { x: 0, y: 0 };


  }

  ngOnInit(): void {
    
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

  

  togglepanel(){
    this.sidePanel = !this.sidePanel;
  }

  toggleBuilding(): void {
    this.isDrawing = !this.isDrawing;
    this.isBuilding = !this.isBuilding;
  }

  openReviewDialog(): void {
    const dialogRef = this.dialog.open(AddshapeComponent, {
      width: '700px',
      panelClass: 'custom-dialog-container',
      data: { }
    });

    const adminContainer = document.querySelector('.admin') as HTMLElement;
    if (adminContainer) {
      adminContainer.classList.add('blurred');
    }

    dialogRef.afterClosed().subscribe(result => {
      if (adminContainer) {
        adminContainer.classList.remove('blurred');
      }
    });
  }

  togglePath(): void {
    this.isDrawing = !this.isDrawing;
    this.isPath = !this.isPath;
  }

  initdrawcanava() {
    let fet = this.mapData.features;
    for (let i = 0; i < fet.length; i++) {
      let obj = this.mapData.features[i];
      if (obj.geometry["type"] === "Polygon") {
       
        for (let i  = 0;i<obj.geometry["coordinates"].length;i++){
          this.shape = obj.geometry["coordinates"][i];
          this.drawOnCanvas(obj.properties["name"]);
          //this.drawPathOncanva();

        }
      }
      if (obj.geometry["type"] === "MultiPolygon") {
        
        for (let i  = 0;i<obj.geometry["coordinates"].length;i++){
          let th = obj.geometry["coordinates"][i];
          //console.log(th[0][0]);
          for(let j = 0;j<th.length;j++){
          this.shape = obj.geometry["coordinates"][i][j];
          this.drawOnCanvas(obj.properties["name"]);
          //this.drawPathOncanva();
          }
        }
      }
      if (obj.geometry["type"] === "LineString") {
        this.shape = obj.geometry["coordinates"];
        //this.drawPathOncanva();
      }
    }
  }
  onMouseCanavaClick(event: MouseEvent): void {
    if (this.isDrawing){
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.ctx.fillStyle = 'blue';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 2, 0, Math.PI * 2);
    this.ctx.fill();
   
    //console.log(event.clientX+" "+event.clientY+" "+rect.top+" "+rect.left);
   // console.log(x+" "+y);
    console.log(this.offset.x+" "+this.offset.y);
    console.log(this.zoomLevel);
    this.shape.push([x,y]);
    this.newshape.push([x/this.zoomLevel-this.offset.x,y/this.zoomLevel-this.offset.y]);
    console.log(this.newshape);
    if (this.isBuilding) {
      this.drawPathOncanva();
      if (this.shape.length >= 2 && this.isStartingPointReached()) {
        
        this.drawOnCanvas("");
        this.openReviewDialog();

      }
    } if (this.isPath) {
      this.drawPathOncanva();
    }
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
    console.log("sysytt"+distance);
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
    this.ctx.moveTo(this.shape[0][0], -this.shape[0][1]);
    for (let i = 1; i < this.shape.length; i++) {
      this.ctx.lineTo(this.shape[i][0],- this.shape[i][1]);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = "#c99e6f";
    this.ctx.fill();
    this.ctx.stroke();
  
    this.drawTextInShape(name);
    this.shape = [];
    this.newshape = [];
    this.ctx.restore();

    
  }

  drawTextInShape(text: string): void {
    const minX = Math.min(...this.shape.map(point => point[0]));
    const maxX = Math.max(...this.shape.map(point => point[0]));
    const minY = Math.min(...this.shape.map(point => -point[1]));
    const maxY = Math.max(...this.shape.map(point => -point[1]));

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
    this.ctx.moveTo(this.shape[0][0], this.shape[0][1]);
    for (let i = 1; i < this.shape.length; i++) {
      //console.log(i);
      this.ctx.lineTo(this.shape[i][0], this.shape[i][1]);
    }
    this.ctx.stroke();
    //console.log(this.shape);
    this.ctx.restore();
  }

 
  onMouseWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoomLevel *= zoomFactor;
    this.zoomLevel = this.zoomLevel>0.5?this.zoomLevel:0.5;
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

}

