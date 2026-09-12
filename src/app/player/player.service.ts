import { computed, Injectable, signal } from '@angular/core';

import { PlayableTrack } from '../api/api.models';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  readonly queue = signal<PlayableTrack[]>([]);
  readonly index = signal(0);
  readonly shuffle = signal(false);
  readonly current = computed(() => {
    const tracks = this.queue();
    const i = this.index();
    return tracks[i] ?? null;
  });

  playAt(track: PlayableTrack, list: PlayableTrack[] = []): void {
    const queue = (list.length > 0 ? list : [track]).filter((item) => !!item.streamUrl);
    const start = queue.findIndex((item) => this.same(item, track));
    this.queue.set(queue);
    this.index.set(start >= 0 ? start : 0);
  }

  toggleShuffle(): void {
    this.shuffle.update((value) => !value);
  }

  setShuffle(value: boolean): void {
    this.shuffle.set(value);
  }

  next(): void {
    const tracks = this.queue();
    if (tracks.length === 0) {
      return;
    }
    if (this.shuffle()) {
      this.index.set(this.randomIndex(tracks.length, this.index()));
      return;
    }
    this.index.set((this.index() + 1) % tracks.length);
  }

  previous(): void {
    const tracks = this.queue();
    if (tracks.length === 0) {
      return;
    }
    if (this.shuffle()) {
      this.index.set(this.randomIndex(tracks.length, this.index()));
      return;
    }
    this.index.set((this.index() - 1 + tracks.length) % tracks.length);
  }

  isCurrent(track: PlayableTrack): boolean {
    const current = this.current();
    return !!current && this.same(current, track);
  }

  private same(a: PlayableTrack, b: PlayableTrack): boolean {
    return a.streamUrl === b.streamUrl && a.title === b.title && a.artist === b.artist;
  }

  private randomIndex(length: number, current: number): number {
    if (length === 1) {
      return 0;
    }
    let next = Math.floor(Math.random() * length);
    while (next === current) {
      next = Math.floor(Math.random() * length);
    }
    return next;
  }
}
