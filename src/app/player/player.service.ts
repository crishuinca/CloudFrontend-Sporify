import { Injectable, signal } from '@angular/core';

import { PlayableTrack } from '../api/api.models';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  readonly current = signal<PlayableTrack | null>(null);

  play(track: PlayableTrack): void {
    this.current.set(track);
  }
}
