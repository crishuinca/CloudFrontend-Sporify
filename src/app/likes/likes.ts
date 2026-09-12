import { Component, inject, signal } from '@angular/core';

import { ApiService } from '../api/api.service';
import { Playlist, PlaylistTrack } from '../api/api.models';
import { PlayerService } from '../player/player.service';

@Component({
  selector: 'app-likes',
  templateUrl: './likes.html',
  styleUrl: './likes.scss',
})
export class Likes {
  private readonly api = inject(ApiService);
  protected readonly player = inject(PlayerService);

  readonly playlist = signal<Playlist | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    this.reload();
  }

  remove(track: PlaylistTrack): void {
    this.api.removeLike(track.id).subscribe({
      next: () => this.reload(),
      error: (err: Error) => this.error.set(err.message),
    });
  }

  private reload(): void {
    this.api.likes().subscribe({
      next: (playlist) => this.playlist.set(playlist),
      error: (err: Error) => this.error.set(err.message),
    });
  }
}
