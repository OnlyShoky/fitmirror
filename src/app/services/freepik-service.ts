import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile } from 'rxjs';

export interface GenerateResponse {
  success: boolean;
  url?: string;
  error?: string;
  taskId?: string;
  message?: string; // <-- Añadir esta propiedad
}

@Injectable({
  providedIn: 'root'
})
export class FreepikService {
  private apiKey = 'FreePikApiKEy'; // Reemplaza con tu API key de FreePIK
  private baseUrl = 'https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview';
  
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'x-freepik-api-key': this.apiKey
  });

  constructor(private http: HttpClient) {}

  // Convertir imagen a base64
  private imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remover el prefijo data:image/...;base64,
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Crear tarea de generación
  createGenerationTask(profileImage: File, clothingImage: File): Observable<any> {
    return new Observable(observer => {
      Promise.all([
        this.imageToBase64(profileImage),
        this.imageToBase64(clothingImage)
      ]).then(([profileBase64, clothingBase64]) => {
        
        const prompt = "Take the original photo of the person and add the clothing from the reference image. Keep the same size, proportions, and pose of the person, only adding the clothing naturally.";

        const data = {
          prompt: prompt,
          reference_images: [profileBase64, clothingBase64]
        };

        this.http.post(this.baseUrl, data, { headers: this.headers })
          .subscribe({
            next: (response: any) => {
              console.log('Task created:', response);
              observer.next(response);
              observer.complete();
            },
            error: (error) => {
              console.error('Error creating task:', error);
              observer.error(error);
            }
          });
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  // Verificar estado de la tarea
  checkTaskStatus(taskId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${taskId}`, { headers: this.headers });
  }

  // Descargar imagen generada
  downloadGeneratedImage(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, { 
      responseType: 'blob',
      headers: this.headers 
    });
  }

  // Proceso completo de generación con polling
  generateTryOnImage(profileImage: File, clothingImage: File): Observable<GenerateResponse> {
    return new Observable(observer => {
      // 1. Crear la tarea
      this.createGenerationTask(profileImage, clothingImage).subscribe({
        next: (response: any) => {
          const taskId = response.data.task_id;
          console.log('Task ID:', taskId);
          
          observer.next({ 
            success: true, 
            taskId: taskId,
            message: 'Task created, waiting for processing...' 
          });

          // 2. Polling para verificar estado
          const pollInterval = interval(5000); // Cada 5 segundos
          const maxAttempts = 60; // Máximo 5 minutos
          let attempts = 0;

          pollInterval.pipe(
            takeWhile(() => attempts < maxAttempts),
            switchMap(() => {
              attempts++;
              console.log(`Checking task status (attempt ${attempts})...`);
              return this.checkTaskStatus(taskId);
            })
          ).subscribe({
            next: (taskResponse: any) => {
              const task = taskResponse.data;
              const status = task.status;
              console.log(`Task status: ${status}`);

              if (status === 'COMPLETED') {
                const generated = task.generated;
                if (generated && generated.length > 0) {
                  // Descargar la primera imagen generada
                  const downloadUrl = generated[0];
                  this.downloadGeneratedImage(downloadUrl).subscribe({
                    next: (blob) => {
                      // Crear URL local para la imagen
                      const imageUrl = URL.createObjectURL(blob);
                      observer.next({ 
                        success: true, 
                        url: imageUrl,
                        message: 'Generation completed successfully'
                      });
                      observer.complete();
                    },
                    error: (error) => {
                      observer.next({ 
                        success: false, 
                        error: `Failed to download image: ${error.message}`,
                        message: 'Download failed'
                      });
                      observer.complete();
                    }
                  });
                } else {
                  observer.next({ 
                    success: false, 
                    error: 'No generated images found',
                    message: 'No images generated'
                  });
                  observer.complete();
                }
              } else if (status === 'FAILED') {
                observer.next({ 
                  success: false, 
                  error: `Task failed: ${task.error || 'Unknown error'}`,
                  message: 'Generation failed'
                });
                observer.complete();
              }
              // Si está PROCESSING, continuamos el polling
            },
            error: (error) => {
              observer.next({ 
                success: false, 
                error: `Error checking task: ${error.message}`,
                message: 'Status check failed'
              });
              observer.complete();
            }
          });
        },
        error: (error) => {
          observer.next({ 
            success: false, 
            error: `Failed to create task: ${error.message}`,
            message: 'Task creation failed'
          });
          observer.complete();
        }
      });
    });
  }
}