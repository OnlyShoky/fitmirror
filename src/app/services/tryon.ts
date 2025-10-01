import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TryOnRequest {
  profileImage: string; // base64
  clothingImage: string; // base64
}

export interface TryOnResponse {
  success: boolean;
  url?: string;
  error?: string;
  taskId?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TryonService {
  private http = inject(HttpClient);

  // Proceso completo de try-on
  processTryOn(request: TryOnRequest): Observable<TryOnResponse> {
    return this.http.post<TryOnResponse>('/.netlify/functions/process-tryon', request);
  }

  // Solo crear tarea (para procesos más controlados)
  createTask(request: TryOnRequest): Observable<TryOnResponse> {
    return this.http.post<TryOnResponse>('/.netlify/functions/create-task', request);
  }

  // Verificar estado de tarea
  checkTaskStatus(taskId: string): Observable<TryOnResponse> {
    return this.http.get<TryOnResponse>(`/.netlify/functions/check-task?taskId=${taskId}`);
  }
}