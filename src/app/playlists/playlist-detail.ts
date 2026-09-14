import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../api/api.service';
import { Playlist, PlaylistTrack } from '../api/api.models';
import { LibraryService } from './library.service';
import { PlayerService } from '../player/player.service';
import { extractAverageColor, gradientFromRgb, PURPLE_BACKDROP } from '../shared/backdrop';
import { readCoverFile } from '../shared/cover-file';
import { formatDuration, playlistInitial } from '../shared/format-time';

@Component({
  selector: 'app-playlist-detail',
  templateUrl: './playlist-detail.html',
  styleUrl: './playlist-detail.scss',
  host: {
    '[style.background]': 'backdrop()',
  },
})
export class PlaylistDetail {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly library = inject(LibraryService);
  protected readonly player = inject(PlayerService);
  protected readonly formatDuration = formatDuration;
  protected readonly playlistInitial = playlistInitial;

  readonly playlist = signal<Playlist | null>(null);
  readonly error = signal<string | null>(null);
  readonly backdrop = signal(PURPLE_BACKDROP);
  private paintToken = 0;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) {
        this.error.set('Playlist inválida');
        this.playlist.set(null);
        return;
      }
      this.error.set(null);
      this.playlist.set(null);
      this.backdrop.set(PURPLE_BACKDROP);
      this.load(id);
    });
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

  onCoverSelected(event: Event): void {
    const current = this.playlist();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!current || !file) {
      return;
    }
    this.error.set(null);
    readCoverFile(file)
      .then((coverUrl) => {
        this.api.updatePlaylist(current.id, { name: current.name, coverUrl }).subscribe({
          next: (updated) => {
            this.playlist.update((playlist) =>
              playlist ? { ...playlist, coverUrl: updated.coverUrl } : playlist,
            );
            this.library.remember(updated);
            this.paintFromCover(updated.coverUrl);
          },
          error: (err: Error) => this.error.set(err.message),
        });
      })
      .catch((err: Error) => this.error.set(err.message));
  }

  private load(id: number): void {
    this.api.getPlaylist(id).subscribe({
      next: (playlist) => {
        this.playlist.set(playlist);
        this.paintFromCover(playlist.coverUrl);
      },
      error: (err: Error) => this.error.set(err.message),
    });
  }

  private paintFromCover(coverUrl: string | null | undefined): void {
    const token = ++this.paintToken;
    if (!coverUrl) {
      this.backdrop.set(PURPLE_BACKDROP);
      return;
    }
    extractAverageColor(coverUrl).then((color) => {
      if (token !== this.paintToken) {
        return;
      }
      if (!color) {
        this.backdrop.set(PURPLE_BACKDROP);
        return;
      }
      this.backdrop.set(gradientFromRgb(color.r, color.g, color.b));
    });
  }
}
