import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { LibraryService } from './playlists/library.service';
import { PlayerService } from './player/player.service';
import { playlistInitial } from './shared/format-time';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly player = inject(PlayerService);
  protected readonly library = inject(LibraryService);
  protected readonly playlistInitial = playlistInitial;
  private readonly audio = viewChild<ElementRef<HTMLAudioElement>>('audio');

  readonly playing = signal(false);
  readonly volume = signal(0.8);
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  readonly volumePct = computed(() => Math.round(this.volume() * 100));
  readonly progressPct = computed(() => {
    const total = this.duration();
    if (!total) {
      return 0;
    }
    return Math.min(100, (this.currentTime() / total) * 100);
  });

  constructor() {
    effect(() => {
      if (this.auth.ready() && this.auth.loggedIn()) {
        this.library.reload();
      }
    });
  }

  setVolume(event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    const pct = Number.isNaN(raw) ? 80 : Math.min(100, Math.max(0, raw));
    this.volume.set(pct / 100);
    const el = this.audio()?.nativeElement;
    if (el) {
      el.volume = this.volume();
    }
  }

  seek(event: Event): void {
    const el = this.audio()?.nativeElement;
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) {
      return;
    }
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isNaN(value)) {
      return;
    }
    el.currentTime = Math.min(el.duration, Math.max(0, value));
    this.currentTime.set(el.currentTime);
  }

  onAudioReady(event: Event): void {
    const el = event.target as HTMLAudioElement;
    el.volume = this.volume();
    this.duration.set(Number.isFinite(el.duration) ? el.duration : 0);
    this.currentTime.set(el.currentTime || 0);
  }

  onTimeUpdate(event: Event): void {
    const el = event.target as HTMLAudioElement;
    this.currentTime.set(el.currentTime || 0);
    if (Number.isFinite(el.duration)) {
      this.duration.set(el.duration);
    }
  }

  formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  togglePlay(): void {
    const el = this.audio()?.nativeElement;
    if (!el || !this.player.current()) {
      return;
    }
    if (el.paused) {
      void el.play();
      return;
    }
    el.pause();
  }

  onEnded(): void {
    this.player.next();
  }
}
