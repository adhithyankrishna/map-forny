import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-addreview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    HttpClientModule
  ],
  templateUrl: './addreview.component.html',
  styleUrls: ['./addreview.component.css']
})
export class AddreviewComponent {
  reviewForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialogRef: MatDialogRef<AddreviewComponent>,
    private fb: FormBuilder,
  ) {
    this.reviewForm = this.fb.group({
      description: ['', Validators.required],
      rating: ['', Validators.required],
      image: [null]
    });
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.reviewForm.patchValue({
        image: file
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitReview(): void {
    if (this.reviewForm.valid) {
      const formData = new FormData();
      formData.append('image', this.reviewForm.get('image')!.value);

      const params = new URLSearchParams({
        description: this.reviewForm.get('description')!.value,
        rating: this.reviewForm.get('rating')!.value,
        placeId: this.data.placeName
      }).toString();

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });

      this.http.post(`http://localhost:8080/new/addreview?${params}`, formData,{headers}).subscribe(
        (response) => {
          console.log('Review submitted successfully', response);
          this.dialogRef.close();
        },
        (error) => {
          console.error('Error submitting review', error);
        }
      );
    }
  }
}
