import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslationService } from '../../services/translation';
import { TryOnRequest, TryonService } from '../../services/tryon';

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
  hasPersistedPhoto: boolean = false;

  // Clothing
  clothingPreview: string | null = null;
  clothingUploadVisible: boolean = true;
  replaceClothingVisible: boolean = false;
  clothingLink: string = '';
  clothingFile: File | null = null;
  clothingFromLink: boolean = false; // Nueva propiedad para trackear si la ropa viene de un link

  // Try On
  tryOnBtnDisabled: boolean = true;
  loading: boolean = false;
  resultSectionVisible: boolean = false;
  resultImage: string | null = null;

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
  }

  ngAfterViewInit() {
    this.setupDragAndDrop();
    this.updateFileInputAcceptAttributes();
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
    // Validar formato
    if (!this.ACCEPTED_FORMATS.includes(file.type)) {
      return {
        isValid: false,
        error: `Formato no soportado: ${file.type}. Use JPG, PNG, WEBP.`
      };
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo ${(this.MAX_FILE_SIZE/ 1024 / 1024).toFixed(2)} MB.`
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
      
      // Validar archivo
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        target.value = ''; // Reset input
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
      
      // Validar archivo
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        target.value = ''; // Reset input
        return;
      }

      // Comprimir imagen antes de procesar
      try {
        const compressedFile = await this.compressImageFile(file, 1, 0.7);
        this.clothingFile = compressedFile;
        this.clothingFromLink = false; // No es de un link

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
      // Validar que sea una URL de imagen
      if (!this.isValidImageUrl(this.clothingLink)) {
        alert('Por favor ingrese una URL válida de imagen (jpg, png, webp)');
        return;
      }

      this.currentStatus = 'Cargando imagen desde enlace...';
      
      try {
        // Convertir la URL a base64
        const imageBase64 = await this.urlToBase64(this.clothingLink);
        
        this.clothingPreview = `data:image/jpeg;base64,${imageBase64}`;
        this.clothingUploadVisible = false;
        this.replaceClothingVisible = true;
        this.clothingFile = null;
        this.clothingFromLink = true; // Marcamos que viene de un link
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
      img.crossOrigin = 'Anonymous'; // Permite CORS para imágenes externas
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        try {
          // Convertir a base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Convertir a JPEG con 90% calidad
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
      
      // Si la imagen está en caché, forzar la carga
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
    
    this.tryOnBtnDisabled = !(userPhotoExists && clothingExists);
  }

  async tryOn() {
    if (this.tryOnBtnDisabled) {
      return;
    }

    this.loading = true;
    this.resultSectionVisible = false;
    this.resultImage = null;
    this.currentStatus = 'Validando y procesando imágenes...';

    try {
      let profileBase64: string;
      let profileFormat: string;

      // Procesar foto de usuario
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

      // Procesar prenda de ropa - AHORA MANEJA AMBOS CASOS
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

      console.log('Formatos detectados:', {
        profile: profileFormat,
        clothing: clothingFormat
      });

      this.currentStatus = 'Creando tarea de generación...';

      const request: TryOnRequest = {
        profileImage: profileBase64,
        clothingImage: clothingBase64,
      };

      this.tryonService.processTryOn(request).subscribe({
        next: (response) => {
          if (response.success && response.url) {
            this.resultImage = response.url;
            this.resultSectionVisible = true;
            this.currentStatus = 'Generación completada!';
            
            setTimeout(() => {
              const resultSection = document.querySelector('.result-section');
              resultSection?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            this.currentStatus = `Error: ${response.error}`;
            alert(`Generation failed: ${response.error}`);
          }
        },
        error: (error) => {
          console.error('API Error:', error);
          this.currentStatus = `Error: ${error.message}`;
          
          // Mensajes de error más específicos
          if (error.status === 0) {
            alert('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
          } else if (error.status === 413) {
            alert('Las imágenes son demasiado grandes. Reduzca el tamaño e intente nuevamente.');
          } else {
            alert('Generation failed. Please try again.');
          }
        },
        complete: () => {
          this.loading = false;
        }
      });

    } catch (error) {
      console.error('Error processing images:', error);
      this.loading = false;
      this.currentStatus = 'Error procesando imágenes';
      alert('Error processing images. Please check your photos and try again.');
    }
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
    
    const format = matches[1]; // jpeg, png, webp, etc.
    const base64 = matches[2];
    
    return { base64, format };
  }

  downloadResult() {
    if (this.resultImage) {
      const link = document.createElement('a');
      link.href = this.resultImage;
      link.download = 'virtual-try-on-result.jpg';
      link.click();
    }
  }

  // Drag and Drop (actualizado con compresión)
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
          // Comprimir imagen en drag & drop también
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
          // Comprimir imagen en drag & drop también
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
        onSuccess('', file); // Pasamos el file directamente para compresión
      } else {
        alert('Please upload an image file (JPG, PNG, WEBP)');
      }
    }
  }

  // NUEVO MÉTODO: Guardar foto de usuario comprimida
  private saveCompressedUserPhoto(dataUrl: string) {
    try {
      // Crear una versión más pequeña para almacenamiento
      this.createThumbnailForStorage(dataUrl).then((compressedDataUrl) => {
        localStorage.setItem('myramyrrorUserPhoto', compressedDataUrl);
      }).catch(() => {
        // Si falla la compresión, no guardar nada
        localStorage.removeItem('myramyrrorUserPhoto');
      });
    } catch (error) {
      // Si hay error de cuota, limpiar storage viejo
      this.clearOldStorage();
    }
  }

  // NUEVO MÉTODO: Crear miniatura para almacenamiento
  private createThumbnailForStorage(dataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Tamaño muy pequeño para almacenamiento (max 400px)
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
        
        // Calidad muy baja para almacenamiento
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  // NUEVO MÉTODO: Limpiar storage viejo
  private clearOldStorage() {
    try {
      localStorage.removeItem('myramyrrorUserPhoto');
      // Puedes añadir más items para limpiar si es necesario
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Método de compresión MEJORADO
  private async compressImageFile(file: File, maxSizeMB = 2, quality = 0.8): Promise<File> {
    // Si el archivo ya es pequeño, no comprimir
    if (file.size <= maxSizeMB * 1024 * 1024) {
      return file;
    }
    
    return new Promise<File>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img;
        const maxDimension = 1200; // Máximo ancho/alto
        
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
              console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
              console.log('Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
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
        // Si falla la compresión, devolver el archivo original
        console.warn('Compression failed, using original file');
        resolve(file);
      };
      img.src = URL.createObjectURL(file);
    });
  }
}