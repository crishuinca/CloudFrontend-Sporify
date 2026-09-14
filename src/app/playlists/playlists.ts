import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiService } from '../api/api.service';
import { LibraryService } from './library.service';
import { playlistInitial } from '../shared/format-time';

@Component({
  selector: 'app-playlists',
  imports: [FormsModule, RouterLink],
  templateUrl: './playlists.html',
  styleUrl: './playlists.scss',
})
export class Playlists {
  private readonly api = inject(ApiService);
  protected readonly library = inject(LibraryService);

  name = '';
  readonly error = signal<string | null>(null);
  protected readonly playlistInitial = playlistInitial;

  create(): void {
    const name = this.name.trim();
    if (!name) {
      return;
    }
    this.error.set(null);
    this.api.createPlaylist(name).subscribe({
      next: (playlist) => {
        this.name = '';
        this.library.remember(playlist);
      },
      error: (err: Error) => this.error.set(err.message),
    });
  }
}
