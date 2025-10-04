import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-try-on',
  templateUrl: './try-on.html',
  styleUrls: ['./try-on.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TryOnComponent {
  @Input() userPhotoUploaded: boolean = false;
  @Input() clothingUploaded: boolean = false;
  
  loading: boolean = false;
  resultImage: string | null = null;

  get canTryOn(): boolean {
    return this.userPhotoUploaded && this.clothingUploaded;
  }

  tryOn() {
    if (!this.canTryOn) return;

    this.loading = true;
    this.resultImage = null;

    // Get user photo from localStorage for demo
    const userPhoto = localStorage.getItem('myramyrrorUserPhoto');

    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      // For demo purposes, use the user photo as result
      this.resultImage = userPhoto;
      
      // Scroll to result
      setTimeout(() => {
        const resultSection = document.querySelector('.result-section');
        resultSection?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 3000);
  }
}