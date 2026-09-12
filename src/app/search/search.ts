import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../api/api.service';
import { AddTrackRequest, JamendoTrack, Playlist } from '../api/api.models';
import { PlayerService } from '../player/player.service';

@Component({
  selector: 'app-search',
  imports: [FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  private readonly api = inject(ApiService);
  protected readonly player = inject(PlayerService);

  query = '';
  readonly tracks = signal<JamendoTrack[]>([]);
  readonly playlists = signal<Playlist[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  selectedPlaylistId: number | null = null;

  constructor() {
    this.api.listPlaylists().subscribe({
      next: (items) => {
        this.playlists.set(items.filter((item) => item.type === 'CUSTOM'));
      },
      error: (err: Error) => this.error.set(err.message),
    });
  }

  search(): void {
    const q = this.query.trim();
    if (!q) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.notice.set(null);
    this.api.searchTracks(q).subscribe({
      next: (tracks) => {
        this.tracks.set(tracks.filter((track) => !!track.streamUrl));
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message);
      },
    });
  }

  like(track: JamendoTrack): void {
    this.save(this.api.addLike(this.toRequest(track)), 'Agregada a Me gusta');
  }

  addToPlaylist(track: JamendoTrack): void {
    if (this.selectedPlaylistId == null) {
      this.error.set('Elige una playlist para agregar la cancion');
      return;
    }
    this.save(
      this.api.addTrackToPlaylist(this.selectedPlaylistId, this.toRequest(track)),
      'Agregada a la playlist',
    );
  }

  private save(request: ReturnType<ApiService['addLike']>, ok: string): void {
    this.error.set(null);
    request.subscribe({
      next: () => this.notice.set(ok),
      error: (err: Error) => this.error.set(err.message),
    });
  }

  private toRequest(track: JamendoTrack): AddTrackRequest {
    return {
      externalId: track.externalId,
      title: track.title,
      artist: track.artist,
      streamUrl: track.streamUrl,
    };
  }
}
