import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../api/api.service';
import { Playlist, PlaylistTrack } from '../api/api.models';
import { PlayerService } from '../player/player.service';

@Component({
  selector: 'app-playlist-detail',
  templateUrl: './playlist-detail.html',
  styleUrl: './playlist-detail.scss',
})
export class PlaylistDetail {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly player = inject(PlayerService);

  readonly playlist = signal<Playlist | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Playlist inválida');
      return;
    }
    this.load(id);
  }

  remove(track: PlaylistTrack): void {
    const current = this.playlist();
    if (!current) {
      return;
    }
    this.api.removeTrackFromPlaylist(current.id, track.id).subscribe({
      next: () => this.load(current.id),
      error: (err: Error) => this.error.set(err.message),
    });
  }

  private load(id: number): void {
    this.api.getPlaylist(id).subscribe({
      next: (playlist) => this.playlist.set(playlist),
      error: (err: Error) => this.error.set(err.message),
    });
  }
}
