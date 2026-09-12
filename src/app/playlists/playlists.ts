import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiService } from '../api/api.service';
import { Playlist } from '../api/api.models';

@Component({
  selector: 'app-playlists',
  imports: [FormsModule, RouterLink],
  templateUrl: './playlists.html',
  styleUrl: './playlists.scss',
})
export class Playlists {
  private readonly api = inject(ApiService);

  name = '';
  readonly items = signal<Playlist[]>([]);
  readonly error = signal<string | null>(null);

  constructor() {
    this.reload();
  }

  create(): void {
    const name = this.name.trim();
    if (!name) {
      return;
    }
    this.error.set(null);
    this.api.createPlaylist(name).subscribe({
      next: () => {
        this.name = '';
        this.reload();
      },
      error: (err: Error) => this.error.set(err.message),
    });
  }

  private reload(): void {
    this.api.listPlaylists().subscribe({
      next: (items) => this.items.set(items),
      error: (err: Error) => this.error.set(err.message),
    });
  }
}
