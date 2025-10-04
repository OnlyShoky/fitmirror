import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-how-it-works',
  templateUrl: './how-it-works.html',
  styleUrls: ['./how-it-works.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HowItWorksComponent implements OnInit, AfterViewInit {
  // User Photo
  userPhotoPreview: string | null = null;
  userPhotoUploadVisible: boolean = true;
  replaceUserPhotoVisible: boolean = false;

  // Clothing
  clothingPreview: string | null = null;
  clothingUploadVisible: boolean = true;
  replaceClothingVisible: boolean = false;
  clothingLink: string = '';

  // Try On
  tryOnBtnDisabled: boolean = true;
  loading: boolean = false;
  resultSectionVisible: boolean = false;
  resultImage: string | null = null;

  ngOnInit() {
    // Check if user photo exists in localStorage
    const savedUserPhoto = localStorage.getItem('myramyrrorUserPhoto');
    if (savedUserPhoto) {
      this.userPhotoPreview = savedUserPhoto;
      this.userPhotoUploadVisible = false;
      this.replaceUserPhotoVisible = true;
      this.checkTryOnButton();
    }
  }

  ngAfterViewInit() {
    this.setupDragAndDrop();
  }

  // User Photo Methods
  triggerUserPhotoInput() {
    const input = document.getElementById('userPhotoInput') as HTMLInputElement;
    input?.click();
  }

  handleUserPhotoUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userPhotoPreview = e.target.result;
        this.userPhotoUploadVisible = false;
        this.replaceUserPhotoVisible = true;
        
        // Save to localStorage
        localStorage.setItem('myramyrrorUserPhoto', e.target.result);
        this.checkTryOnButton();
      };
      reader.readAsDataURL(file);
    }
  }

  replaceUserPhoto() {
    this.userPhotoPreview = null;
    this.userPhotoUploadVisible = true;
    this.replaceUserPhotoVisible = false;
    localStorage.removeItem('myramyrrorUserPhoto');
    this.checkTryOnButton();
  }

  // Clothing Methods
  triggerClothingInput() {
    const input = document.getElementById('clothingInput') as HTMLInputElement;
    input?.click();
  }

  handleClothingUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.clothingPreview = e.target.result;
        this.clothingUploadVisible = false;
        this.replaceClothingVisible = true;
        this.checkTryOnButton();
      };
      reader.readAsDataURL(file);
    }
  }

  replaceClothing() {
    this.clothingPreview = null;
    this.clothingUploadVisible = true;
    this.replaceClothingVisible = false;
    this.checkTryOnButton();
  }

  loadFromLink() {
    if (this.clothingLink.trim()) {
      this.clothingPreview = this.clothingLink;
      this.clothingUploadVisible = false;
      this.replaceClothingVisible = true;
      this.checkTryOnButton();
    } else {
      alert('Please enter a valid image URL');
    }
  }

  // Try On Methods
  checkTryOnButton() {
    const userPhotoExists = !!this.userPhotoPreview;
    const clothingExists = !!this.clothingPreview;
    this.tryOnBtnDisabled = !(userPhotoExists && clothingExists);
  }

  tryOn() {
    if (this.tryOnBtnDisabled) return;

    this.loading = true;
    this.resultSectionVisible = false;

    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.resultSectionVisible = true;
      
      // For demo purposes, use the user photo as result
      this.resultImage = this.userPhotoPreview;

      // Scroll to result
      setTimeout(() => {
        const resultSection = document.querySelector('.result-section');
        resultSection?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 3000);
  }

  // Drag and Drop
  setupDragAndDrop() {
    this.setupSingleDragAndDrop(
      'userPhotoUpload',
      'userPhotoInput',
      (result: string) => {
        this.userPhotoPreview = result;
        this.userPhotoUploadVisible = false;
        this.replaceUserPhotoVisible = true;
        localStorage.setItem('myramyrrorUserPhoto', result);
        this.checkTryOnButton();
      }
    );

    this.setupSingleDragAndDrop(
      'clothingUpload',
      'clothingInput',
      (result: string) => {
        this.clothingPreview = result;
        this.clothingUploadVisible = false;
        this.replaceClothingVisible = true;
        this.checkTryOnButton();
      }
    );
  }

  setupSingleDragAndDrop(dropAreaId: string, inputId: string, onSuccess: (result: string) => void) {
    const dropArea = document.getElementById(dropAreaId);
    const inputElement = document.getElementById(inputId) as HTMLInputElement;

    if (!dropArea || !inputElement) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, this.preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, this.highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, this.unhighlight, false);
    });

    dropArea.addEventListener('drop', (e) => this.handleDrop(e, inputElement, onSuccess), false);
  }

  preventDefaults(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  highlight(e: Event) {
    const target = e.currentTarget as HTMLElement;
    target.style.borderColor = 'var(--accent-color)';
    target.style.backgroundColor = 'rgba(45, 90, 160, 0.05)';
  }

  unhighlight(e: Event) {
    const target = e.currentTarget as HTMLElement;
    target.style.borderColor = 'var(--gray-light)';
    target.style.backgroundColor = 'white';
  }

  handleDrop(e: DragEvent, inputElement: HTMLInputElement, onSuccess: (result: string) => void) {
    const dt = e.dataTransfer;
    if (!dt) return;

    const files = dt.files;
    inputElement.files = files;

    if (files.length > 0) {
      const file = files[0];
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onSuccess(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload an image file');
      }
    }
  }
}