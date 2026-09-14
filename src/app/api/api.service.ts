import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  AddTrackRequest,
  JamendoTrack,
  Playlist,
  PlaylistTrack,
  UserProfile,
} from './api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/users/me`).pipe(catchError(this.fail));
  }

  searchTracks(query: string, limit = 20): Observable<JamendoTrack[]> {
    return this.http
      .get<JamendoTrack[]>(`${this.base}/tracks/search`, { params: { q: query, limit } })
      .pipe(catchError(this.fail));
  }

  listPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.base}/playlists`).pipe(catchError(this.fail));
  }

  getPlaylist(id: number): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.base}/playlists/${id}`).pipe(catchError(this.fail));
  }

  createPlaylist(name: string): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.base}/playlists`, { name }).pipe(catchError(this.fail));
  }

  updatePlaylist(id: number, body: { name?: string; coverUrl?: string | null }): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.base}/playlists/${id}`, body).pipe(catchError(this.fail));
  }

  addTrackToPlaylist(playlistId: number, track: AddTrackRequest): Observable<PlaylistTrack> {
    return this.http
      .post<PlaylistTrack>(`${this.base}/playlists/${playlistId}/tracks`, track)
      .pipe(catchError(this.fail));
  }

  removeTrackFromPlaylist(playlistId: number, trackId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/playlists/${playlistId}/tracks/${trackId}`)
      .pipe(catchError(this.fail));
  }

  likes(): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.base}/likes`).pipe(catchError(this.fail));
  }

  addLike(track: AddTrackRequest): Observable<PlaylistTrack> {
    return this.http.post<PlaylistTrack>(`${this.base}/likes`, track).pipe(catchError(this.fail));
  }

  removeLike(trackId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/likes/${trackId}`).pipe(catchError(this.fail));
  }

  private fail = (error: HttpErrorResponse) =>
    throwError(() => new Error(this.messageOf(error)));

  private messageOf(error: HttpErrorResponse): string {
    const body = error.error as { message?: string } | string | null;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object' && body.message) {
      return body.message;
    }
    if (error.status === 401) {
      return 'No autorizado (401). Cierra sesion, inicia sesion de nuevo y recarga.';
    }
    if (error.status === 0) {
      return 'No se pudo conectar con el backend. Comprueba que este en marcha en el puerto 8080.';
    }
    return `Error ${error.status || ''} al llamar a la API`.trim();
  }
}
