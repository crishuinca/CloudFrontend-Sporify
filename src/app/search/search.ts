import { Component, HostListener, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../api/api.service';
import { AddTrackRequest, JamendoTrack, Playlist } from '../api/api.models';
import { LibraryService } from '../playlists/library.service';
import { PlayerService } from '../player/player.service';
import { formatDuration, playlistInitial } from '../shared/format-time';

@Component({
  selector: 'app-search',
  imports: [FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnDestroy {
  private readonly api = inject(ApiService);
  protected readonly player = inject(PlayerService);
  protected readonly library = inject(LibraryService);

  query = '';
  newPlaylistName = '';
  readonly tracks = signal<JamendoTrack[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly likeNotice = signal<Record<string, string>>({});
  readonly playlistNotice = signal<Record<string, string>>({});
  readonly menuTrackId = signal<string | null>(null);
  readonly showCreateForm = signal(false);
  private readonly noticeTimers = new Map<string, ReturnType<typeof setTimeout>>();

  protected readonly formatDuration = formatDuration;
  protected readonly playlistInitial = playlistInitial;

  ngOnDestroy(): void {
    this.noticeTimers.forEach((timer) => clearTimeout(timer));
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.menuTrackId.set(null);
    this.showCreateForm.set(false);
    this.newPlaylistName = '';
  }

  search(): void {
    const q = this.query.trim();
    if (!q) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
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
    this.error.set(null);
    this.api.addLike(this.toRequest(track)).subscribe({
      next: () => this.patchNotice(this.likeNotice, track.externalId, 'Agregada a "Me gusta"'),
      error: (err: Error) => this.error.set(err.message),
    });
  }

  toggleMenu(event: MouseEvent, track: JamendoTrack): void {
    event.stopPropagation();
    const open = this.menuTrackId() === track.externalId;
    this.menuTrackId.set(open ? null : track.externalId);
    this.showCreateForm.set(false);
    this.newPlaylistName = '';
  }

  keepMenu(event: MouseEvent): void {
    event.stopPropagation();
  }

  startCreate(event: MouseEvent): void {
    event.stopPropagation();
    this.showCreateForm.set(true);
  }

  addToExisting(playlist: Playlist, track: JamendoTrack): void {
    this.error.set(null);
    this.api.addTrackToPlaylist(playlist.id, this.toRequest(track)).subscribe({
      next: () => {
        this.patchNotice(this.playlistNotice, track.externalId, `Agregado a playlist ${playlist.name}`);
        this.closeMenu();
      },
      error: (err: Error) => this.error.set(err.message),
    });
  }

  createAndAdd(track: JamendoTrack): void {
    const name = this.newPlaylistName.trim();
    if (!name) {
      this.error.set('Escribe un nombre para la playlist');
      return;
    }
    this.error.set(null);
    this.api.createPlaylist(name).subscribe({
      next: (playlist) => {
        this.library.remember(playlist);
        this.api.addTrackToPlaylist(playlist.id, this.toRequest(track)).subscribe({
          next: () => {
            this.patchNotice(this.playlistNotice, track.externalId, `Agregado a playlist ${playlist.name}`);
            this.closeMenu();
          },
          error: (err: Error) => this.error.set(err.message),
        });
      },
      error: (err: Error) => this.error.set(err.message),
    });
  }

  private patchNotice(
    store: ReturnType<typeof signal<Record<string, string>>>,
    id: string,
    message: string,
  ): void {
    const key = `${store === this.likeNotice ? 'like' : 'playlist'}:${id}`;
    const previous = this.noticeTimers.get(key);
    if (previous) {
      clearTimeout(previous);
    }
    store.update((current) => ({ ...current, [id]: message }));
    this.noticeTimers.set(
      key,
      setTimeout(() => {
        store.update((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
        this.noticeTimers.delete(key);
      }, 3000),
    );
  }

  private toRequest(track: JamendoTrack): AddTrackRequest {
    return {
      externalId: track.externalId,
      title: track.title,
      artist: track.artist,
      streamUrl: track.streamUrl,
      imageUrl: track.imageUrl,
      durationSeconds: track.durationSeconds,
    };
  }
}
