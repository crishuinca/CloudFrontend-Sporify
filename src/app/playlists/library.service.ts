import { computed, inject, Injectable, signal } from '@angular/core';

import { ApiService } from '../api/api.service';
import { Playlist } from '../api/api.models';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly api = inject(ApiService);

  readonly items = signal<Playlist[]>([]);
  readonly custom = computed(() => this.items().filter((item) => item.type === 'CUSTOM'));

  reload(): void {
    this.api.listPlaylists().subscribe({
      next: (items) => this.items.set(items),
    });
  }

  remember(playlist: Playlist): void {
    this.items.update((list) => {
      const index = list.findIndex((item) => item.id === playlist.id);
      if (index < 0) {
        return [...list, playlist];
      }
      const next = [...list];
      next[index] = { ...next[index], ...playlist };
      return next;
    });
  }
}
