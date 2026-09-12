import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, switchMap, take } from 'rxjs';

import { ApiService } from '../api/api.service';
import { UserProfile } from '../api/api.models';
import { AuthService } from '../auth/auth.service';
import { LibraryService } from '../playlists/library.service';
import { playlistInitial } from '../shared/format-time';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly auth = inject(AuthService);
  protected readonly library = inject(LibraryService);
  protected readonly playlistInitial = playlistInitial;
  private readonly api = inject(ApiService);
  private readonly broadcast = inject(MsalBroadcastService);

  readonly profile = signal<UserProfile | null>(null);
  readonly error = signal<string | null>(null);
  readonly greeting = this.makeGreeting();

  constructor() {
    this.broadcast.inProgress$
      .pipe(
        filter((status) => status === InteractionStatus.None),
        take(1),
        switchMap(() => this.api.me()),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (profile) => this.profile.set(profile),
        error: (err: Error) => this.error.set(err.message),
      });
  }

  private makeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Buenos dias';
    }
    if (hour < 19) {
      return 'Buenas tardes';
    }
    return 'Buenas noches';
  }
}
