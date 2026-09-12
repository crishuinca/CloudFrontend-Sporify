export interface UserProfile {
  id: number;
  azureSub: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface JamendoTrack {
  externalId: string;
  title: string;
  artist: string;
  streamUrl: string;
  imageUrl: string | null;
}

export interface PlaylistTrack {
  id: number;
  externalId: string;
  source: string;
  title: string;
  artist: string;
  streamUrl: string;
  position: number;
}

export interface Playlist {
  id: number;
  name: string;
  type: 'LIKES' | 'CUSTOM';
  createdAt: string;
  tracks: PlaylistTrack[];
}

export interface AddTrackRequest {
  externalId: string;
  title: string;
  artist: string;
  streamUrl: string;
}

export interface PlayableTrack {
  title: string;
  artist: string;
  streamUrl: string;
  imageUrl?: string | null;
}
