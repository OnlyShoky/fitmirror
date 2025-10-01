import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TryOnRequest {
  profileImage: string; // base64
  clothingImage: string; // base64
  apiKey?: string; // API key opcional - si no se envía, usará la del servidor
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

  // Proceso completo de try-on - compatible con ambas modalidades
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

  // Método específico para usar API key del servidor (modalidad original)
  processTryOnWithServerKey(request: Omit<TryOnRequest, 'apiKey'>): Observable<TryOnResponse> {
    // No enviamos apiKey, así que la función usará la del servidor
    const requestWithoutApiKey: TryOnRequest = {
      profileImage: request.profileImage,
      clothingImage: request.clothingImage
    };
    return this.processTryOn(requestWithoutApiKey);
  }

  // Método específico para usar API key del usuario (nueva modalidad)
  processTryOnWithUserKey(profileImage: string, clothingImage: string, userApiKey: string): Observable<TryOnResponse> {
    const request: TryOnRequest = {
      profileImage,
      clothingImage,
      apiKey: userApiKey
    };
    return this.processTryOn(request);
  }

  // Método inteligente que detecta qué modalidad usar
  processTryOnSmart(request: TryOnRequest): Observable<TryOnResponse> {
    // Si viene con apiKey, usamos la modalidad de usuario
    // Si no viene con apiKey, usamos la modalidad del servidor
    return this.processTryOn(request);
  }
}