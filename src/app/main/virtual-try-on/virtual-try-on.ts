import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FreepikService, GenerateResponse } from '../../services/freepik-service';
import { TranslationService } from '../../services/translation';

@Component({
  selector: 'app-virtual-try-on',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './virtual-try-on.html',
  styleUrl: './virtual-try-on.scss'
})
export class VirtualTryOn implements OnInit, AfterViewInit {
  // User Photo
  userPhotoPreview: string | null = null;
  userPhotoUploadVisible: boolean = true;
  replaceUserPhotoVisible: boolean = false;
  userPhotoFile: File | null = null;

  // Clothing
  clothingPreview: string | null = null;
  clothingUploadVisible: boolean = true;
  replaceClothingVisible: boolean = false;
  clothingLink: string = '';
  clothingFile: File | null = null;

  // Try On
  tryOnBtnDisabled: boolean = true;
  loading: boolean = false;
  resultSectionVisible: boolean = false;
  resultImage: string | null = null;

  // Status
  currentStatus: string = '';

  constructor(private freepikService: FreepikService) {}

    private translationService = inject(TranslationService);

  // Reactive translations using computed signals
  translations = this.translationService.currentTranslations;

  ngOnInit() {
    const savedUserPhoto = localStorage.getItem('fitMirrorUserPhoto');
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
      this.userPhotoFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userPhotoPreview = e.target.result;
        this.userPhotoUploadVisible = false;
        this.replaceUserPhotoVisible = true;
        localStorage.setItem('fitMirrorUserPhoto', e.target.result);
        this.checkTryOnButton();
      };
      reader.readAsDataURL(file);
    }
  }

  replaceUserPhoto() {
    this.userPhotoPreview = null;
    this.userPhotoUploadVisible = true;
    this.replaceUserPhotoVisible = false;
    this.userPhotoFile = null;
    localStorage.removeItem('fitMirrorUserPhoto');
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
      this.clothingFile = file;
      
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
    this.clothingFile = null;
    this.checkTryOnButton();
  }

  loadFromLink() {
    if (this.clothingLink.trim()) {
      this.clothingPreview = this.clothingLink;
      this.clothingUploadVisible = false;
      this.replaceClothingVisible = true;
      this.clothingFile = null;
      this.checkTryOnButton();
    } else {
      alert('Please enter a valid image URL');
    }
  }

  // Try On Methods
  checkTryOnButton() {
    const userPhotoExists = !!this.userPhotoFile;
    const clothingExists = !!this.clothingFile;
    this.tryOnBtnDisabled = !(userPhotoExists && clothingExists);
  }

  tryOn() {
    if (this.tryOnBtnDisabled || !this.userPhotoFile || !this.clothingFile) {
      return;
    }

    this.loading = true;
    this.resultSectionVisible = false;
    this.resultImage = null;
    this.currentStatus = 'Creating generation task...';

    this.freepikService.generateTryOnImage(this.userPhotoFile, this.clothingFile)
      .subscribe({
        next: (response: GenerateResponse) => {
          if (response.url) {
            this.resultImage = response.url;
            this.resultSectionVisible = true;
            this.currentStatus = 'Generation completed!';
            
            setTimeout(() => {
              const resultSection = document.querySelector('.result-section');
              resultSection?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else if (response.message) {
            this.currentStatus = response.message;
          }
        },
        error: (error: GenerateResponse) => {
          console.error('Generation error:', error);
          this.currentStatus = `Error: ${error.error}`;
          alert(`Generation failed: ${error.error}`);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  downloadResult() {
    if (this.resultImage) {
      const link = document.createElement('a');
      link.href = this.resultImage;
      link.download = 'virtual-try-on-result.jpg';
      link.click();
    }
  }

  // Drag and Drop
  setupDragAndDrop() {
    this.setupSingleDragAndDrop(
      'userPhotoUpload',
      'userPhotoInput',
      (result: string, file: File) => {
        this.userPhotoPreview = result;
        this.userPhotoFile = file;
        this.userPhotoUploadVisible = false;
        this.replaceUserPhotoVisible = true;
        localStorage.setItem('fitMirrorUserPhoto', result);
        this.checkTryOnButton();
      }
    );

    this.setupSingleDragAndDrop(
      'clothingUpload',
      'clothingInput',
      (result: string, file: File) => {
        this.clothingPreview = result;
        this.clothingFile = file;
        this.clothingUploadVisible = false;
        this.replaceClothingVisible = true;
        this.checkTryOnButton();
      }
    );
  }

  setupSingleDragAndDrop(dropAreaId: string, inputId: string, onSuccess: (result: string, file: File) => void) {
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

  handleDrop(e: DragEvent, inputElement: HTMLInputElement, onSuccess: (result: string, file: File) => void) {
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
            onSuccess(event.target.result as string, file);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload an image file');
      }
    }
  }
}