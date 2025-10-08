import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslationService } from '../../services/translation';
import { TryOnRequest, TryonService } from '../../services/tryon';

@Component({
  selector: 'app-virtual-try-on-with-apikey',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './virtual-try-on-with-apikey.html',
  styleUrl: './virtual-try-on-with-apikey.scss'
})
export class VirtualTryOnWithApiKey implements OnInit, AfterViewInit {
  // API Key del usuario
  userApiKey: string = '';
  
  // User Photo
  userPhotoPreview: string | null = null;
  userPhotoUploadVisible: boolean = true;
  replaceUserPhotoVisible: boolean = false;
  userPhotoFile: File | null = null;
  hasPersistedPhoto: boolean = false;

  // Clothing
  clothingPreview: string | null = null;
  clothingUploadVisible: boolean = true;
  replaceClothingVisible: boolean = false;
  clothingLink: string = '';
  clothingFile: File | null = null;
  clothingFromLink: boolean = false;

  // Try On
  tryOnBtnDisabled: boolean = true;
  loading: boolean = false;
  resultSectionVisible: boolean = false;
  resultImage: string | null = null;

  // Enhanced properties
  progress: number = 0;
  fullscreenVisible: boolean = false;

  // Status
  currentStatus: string = '';

  // Formatos aceptados
  private readonly ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  private tryonService = inject(TryonService);
  private translationService = inject(TranslationService);

  translations = this.translationService.currentTranslations;

  ngOnInit() {
    this.loadPersistedUserPhoto();
    this.loadSavedApiKey();
  }

  ngAfterViewInit() {
    this.setupDragAndDrop();
    this.updateFileInputAcceptAttributes();
  }

  // Cargar API Key guardada
  private loadSavedApiKey() {
    const savedApiKey = localStorage.getItem('myramyrrorUserApiKey');
    if (savedApiKey) {
      this.userApiKey = savedApiKey;
    }
  }

  // Guardar API Key cuando cambia
  onApiKeyChange() {
    if (this.userApiKey.trim()) {
      localStorage.setItem('myramyrrorUserApiKey', this.userApiKey);
    } else {
      localStorage.removeItem('myramyrrorUserApiKey');
    }
    this.checkTryOnButton();
  }

  // Mostrar información sobre la API Key
  showApiKeyInfo() {
    const message = this.translations().apiKeyInfoMessage || 
      'You need a Freepik API key to use the virtual try-on feature.\n\n' +
      'How to get your API key:\n' +
      '1. Go to https://freepik.com/api\n' +
      '2. Sign up or log in to your Freepik account\n' +
      '3. Generate an API key from your dashboard\n' +
      '4. Copy and paste the key here\n\n' +
      'Your API key is stored locally in your browser and never shared with us.';
    
    alert(message);
  }

  // Actualizar los inputs para aceptar todos los formatos
  private updateFileInputAcceptAttributes() {
    const userInput = document.getElementById('userPhotoInput') as HTMLInputElement;
    const clothingInput = document.getElementById('clothingInput') as HTMLInputElement;
    
    if (userInput) {
      userInput.accept = '.jpg,.jpeg,.png,.webp';
    }
    if (clothingInput) {
      clothingInput.accept = '.jpg,.jpeg,.png,.webp';
    }
  }

  private loadPersistedUserPhoto() {
    try {
      const savedUserPhoto = localStorage.getItem('myramyrrorUserPhoto');
      if (savedUserPhoto) {
        this.userPhotoPreview = savedUserPhoto;
        this.userPhotoUploadVisible = false;
        this.replaceUserPhotoVisible = true;
        this.hasPersistedPhoto = true;
        this.checkTryOnButton();
      }
    } catch (error) {
      console.warn('Error loading persisted photo:', error);
      this.clearOldStorage();
    }
  }

  // Validar archivo
  private validateFile(file: File): { isValid: boolean; error?: string } {
    if (!this.ACCEPTED_FORMATS.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file format: ${file.type}. Only JPG, PNG, and WEBP are allowed.`
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max allowed: ${(this.MAX_FILE_SIZE/ 1024 / 1024).toFixed(2)} MB.`
      };
    }

    return { isValid: true };
  }

  // User Photo Methods
  triggerUserPhotoInput() {
    const input = document.getElementById('userPhotoInput') as HTMLInputElement;
    input?.click();
  }

  async handleUserPhotoUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      const file = target.files[0];
      
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        target.value = '';
        return;
      }

      // Comprimir imagen antes de procesar
      try {
        const compressedFile = await this.compressImageFile(file, 1, 0.7); // Más compresión para almacenamiento
        this.userPhotoFile = compressedFile;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.userPhotoPreview = e.target.result;
          this.userPhotoUploadVisible = false;
          this.replaceUserPhotoVisible = true;
          this.hasPersistedPhoto = false;
          
          // Guardar versión comprimida en localStorage
          this.saveCompressedUserPhoto(e.target.result as string);
          
          this.checkTryOnButton();
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Error processing image. Please try again with a smaller file.');
        target.value = '';
      }
    }
  }

  replaceUserPhoto() {
    this.userPhotoPreview = null;
    this.userPhotoUploadVisible = true;
    this.replaceUserPhotoVisible = false;
    this.userPhotoFile = null;
    this.hasPersistedPhoto = false;
    
    try {
      localStorage.removeItem('myramyrrorUserPhoto');
    } catch (error) {
      console.warn('Error removing photo from storage:', error);
    }
    
    this.checkTryOnButton();
    
    const input = document.getElementById('userPhotoInput') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  // Clothing Methods
  triggerClothingInput() {
    const input = document.getElementById('clothingInput') as HTMLInputElement;
    input?.click();
  }

  async handleClothingUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      const file = target.files[0];
      
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        target.value = '';
        return;
      }

      // Comprimir imagen antes de procesar
      try {
        const compressedFile = await this.compressImageFile(file, 1, 0.7);
        this.clothingFile = compressedFile;
        this.clothingFromLink = false;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.clothingPreview = e.target.result;
          this.clothingUploadVisible = false;
          this.replaceClothingVisible = true;
          this.checkTryOnButton();
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Error processing image. Please try again with a smaller file.');
        target.value = '';
      }
    }
  }

  replaceClothing() {
    this.clothingPreview = null;
    this.clothingUploadVisible = true;
    this.replaceClothingVisible = false;
    this.clothingFile = null;
    this.clothingFromLink = false;
    this.checkTryOnButton();
    
    const input = document.getElementById('clothingInput') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  async loadFromLink() {
    if (this.clothingLink.trim()) {
      if (!this.isValidImageUrl(this.clothingLink)) {
        alert('Please enter a valid image URL (jpg, png, webp)');
        return;
      }

      this.currentStatus = 'Loading image from URL...';
      try {
        const imageBase64 = await this.urlToBase64(this.clothingLink);
        
        this.clothingPreview = `data:image/jpeg;base64,${imageBase64}`;
        this.clothingUploadVisible = false;
        this.replaceClothingVisible = true;
        this.clothingFile = null;
        this.clothingFromLink = true;
        this.checkTryOnButton();
        this.currentStatus = '';
        
      } catch (error) {
        console.error('Error loading image from URL:', error);
        alert('Error cargando la imagen desde el enlace. Verifique que la URL sea accesible.');
        this.currentStatus = '';
      }
    } else {
      alert('Please enter a valid image URL');
    }
  }

  // Método para convertir URL a base64
  private urlToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          const base64 = dataUrl.split(',')[1];
          resolve(base64);
        } catch (error) {
          reject(new Error('Error converting image to base64'));
        }
      };
      
      img.onerror = () => {
        reject(new Error('Error loading image from URL'));
      };
      
      img.src = url;
      
      if (img.complete || img.complete === undefined) {
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = url;
      }
    });
  }

  private isValidImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  }

  checkTryOnButton() {
    const userPhotoExists = !!this.userPhotoFile || this.hasPersistedPhoto;
    const clothingExists = !!this.clothingFile || !!this.clothingPreview;
    const hasApiKey = !!this.userApiKey?.trim();
    
    this.tryOnBtnDisabled = !(userPhotoExists && clothingExists && hasApiKey);
  }

  async tryOn() {
    if (this.tryOnBtnDisabled || !this.userApiKey?.trim()) {
      if (!this.userApiKey?.trim()) {
        alert('Please enter your Freepik API key first');
      }
      return;
    }

    this.loading = true;
    this.resultSectionVisible = false;
    this.resultImage = null;
    this.progress = 0;
    this.currentStatus = 'Validating and processing images...';

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      this.progress += Math.random() * 15;
      if (this.progress >= 90) {
        clearInterval(progressInterval);
      }
    }, 500);

    try {
      let profileBase64: string;
      let profileFormat: string;
      
      // Procesar foto de usuario CON COMPRESIÓN
      if (this.userPhotoFile) {
        // Compress if needed - usar compresión más agresiva para envío
        const compressedUserPhoto = await this.compressImageFile(this.userPhotoFile, 2, 0.8);
        const result = await this.fileToBase64WithFormat(compressedUserPhoto);
        profileBase64 = result.base64;
        profileFormat = result.format;
      } else if (this.hasPersistedPhoto && this.userPhotoPreview) {
        const result = this.extractBase64FromDataUrl(this.userPhotoPreview);
        profileBase64 = result.base64;
        profileFormat = result.format;
      } else {
        throw new Error('No user photo available');
      }

      let clothingBase64: string;
      let clothingFormat: string;

      // Procesar prenda de ropa CON COMPRESIÓN
      if (this.clothingFile) {
        // Compress if needed - usar compresión más agresiva para envío
        const compressedClothing = await this.compressImageFile(this.clothingFile, 2, 0.8);
        const result = await this.fileToBase64WithFormat(compressedClothing);
        clothingBase64 = result.base64;
        clothingFormat = result.format;
      } else if (this.clothingFromLink && this.clothingPreview) {
        const result = this.extractBase64FromDataUrl(this.clothingPreview);
        clothingBase64 = result.base64;
        clothingFormat = result.format;
      } else {
        throw new Error('No clothing image available');
      }

      this.currentStatus = 'Creating generation task...';

      const request: TryOnRequest = {
        profileImage: profileBase64,
        clothingImage: clothingBase64,
        apiKey: this.userApiKey.trim() // Enviamos la API key del usuario
      };

      this.tryonService.processTryOn(request).subscribe({
        next: (response) => {
          if (response.success && response.url) {
            this.resultImage = response.url;
            this.progress = 100;
            
            setTimeout(() => {
              this.loading = false;
              this.resultSectionVisible = true;
              this.currentStatus = 'Generación completada!';
              clearInterval(progressInterval);
            }, 500);
          } else {
            this.currentStatus = `Error: ${response.error}`;
            alert(`Generation failed: ${response.error}`);
            this.loading = false;
            clearInterval(progressInterval);
          }
        },
        error: (error) => {
          console.error('API Error:', error);
          this.currentStatus = `Error: ${error.message}`;
          this.loading = false;
          clearInterval(progressInterval);
          
          if (error.status === 0) {
            alert('Connection error. Please check your internet connection and try again.');
          } else if (error.status === 401) {
            alert('Invalid API key. Please check your Freepik API key and try again.');
          } else if (error.status === 413) {
            alert('Images are too large. Please resize them and try again.');
          } else {
            alert('Generation failed. Please try again.');
          }
        },
        complete: () => {
          clearInterval(progressInterval);
        }
      });

    } catch (error) {
      console.error('Error processing images:', error);
      this.loading = false;
      this.currentStatus = 'Error procesando imágenes';
      clearInterval(progressInterval);
      alert('Error processing images. Please check your photos and try again.');
    }
  }

  // New enhanced methods
  closeResult() {
    this.resultSectionVisible = false;
    this.resultImage = null;
  }

  openFullscreen() {
    this.fullscreenVisible = true;
  }

  closeFullscreen() {
    this.fullscreenVisible = false;
  }

  // Enhanced download method
  // Enhanced download method
  async downloadResult() {
    if (!this.resultImage) return;

    try {
      // If it's already a data URL, download directly
      if (this.resultImage.startsWith('data:')) {
        this.downloadDataUrl(this.resultImage, 'virtual-try-on-result.jpg');
        return;
      }

      // If it's a URL, fetch and convert to blob
      const response = await fetch(this.resultImage);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `virtual-try-on-${new Date().getTime()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    }
  }

  // Helper method to download data URLs
  private downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  // Método mejorado para convertir a base64 con información de formato
  private fileToBase64WithFormat(file: File): Promise<{ base64: string; format: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const result = this.extractBase64FromDataUrl(dataUrl);
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Extraer base64 y formato desde data URL
  private extractBase64FromDataUrl(dataUrl: string): { base64: string; format: string } {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Formato Data URL inválido');
    }
    
    const format = matches[1];
    const base64 = matches[2];
    
    return { base64, format };
  }

  // Drag and Drop
  setupDragAndDrop() {
    this.setupSingleDragAndDrop(
      'userPhotoUpload',
      'userPhotoInput',
      async (result: string, file: File) => {
        const validation = this.validateFile(file);
        if (!validation.isValid) {
          alert(validation.error);
          return;
        }
        
        try {
          const compressedFile = await this.compressImageFile(file, 1, 0.7);
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.userPhotoPreview = e.target.result;
            this.userPhotoFile = compressedFile;
            this.userPhotoUploadVisible = false;
            this.replaceUserPhotoVisible = true;
            this.hasPersistedPhoto = false;
            this.saveCompressedUserPhoto(e.target.result as string);
            this.checkTryOnButton();
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          alert('Error processing image. Please try again with a smaller file.');
        }
      }
    );

    this.setupSingleDragAndDrop(
      'clothingUpload',
      'clothingInput',
      async (result: string, file: File) => {
        const validation = this.validateFile(file);
        if (!validation.isValid) {
          alert(validation.error);
          return;
        }
        
        try {
          const compressedFile = await this.compressImageFile(file, 1, 0.7);
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.clothingPreview = e.target.result;
            this.clothingFile = compressedFile;
            this.clothingUploadVisible = false;
            this.replaceClothingVisible = true;
            this.clothingFromLink = false;
            this.checkTryOnButton();
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          alert('Error processing image. Please try again with a smaller file.');
        }
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
        onSuccess('', file);
      } else {
        alert('Please upload an image file (JPG, PNG, WEBP)');
      }
    }
  }

  // Guardar foto de usuario comprimida
  private saveCompressedUserPhoto(dataUrl: string) {
    try {
      this.createThumbnailForStorage(dataUrl).then((compressedDataUrl) => {
        localStorage.setItem('myramyrrorUserPhoto', compressedDataUrl);
      }).catch(() => {
        localStorage.removeItem('myramyrrorUserPhoto');
      });
    } catch (error) {
      this.clearOldStorage();
    }
  }

  // Crear miniatura para almacenamiento
  private createThumbnailForStorage(dataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  // Limpiar storage viejo
  private clearOldStorage() {
    try {
      localStorage.removeItem('myramyrrorUserPhoto');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Método de compresión
  private async compressImageFile(file: File, maxSizeMB = 2, quality = 0.8): Promise<File> {
    if (file.size <= maxSizeMB * 1024 * 1024) {
      return file;
    }
    
    return new Promise<File>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        let { width, height } = img;
        const maxDimension = 1200;
        
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { 
                type: 'image/jpeg',
                lastModified: new Date().getTime()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        console.warn('Compression failed, using original file');
        resolve(file);
      };
      img.src = URL.createObjectURL(file);
    });
  }
}