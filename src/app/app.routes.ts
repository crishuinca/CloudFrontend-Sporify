import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

import { Home } from './home/home';
import { Likes } from './likes/likes';
import { Login } from './login/login';
import { PlaylistDetail } from './playlists/playlist-detail';
import { Playlists } from './playlists/playlists';
import { Search } from './search/search';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', component: Home, canActivate: [MsalGuard] },
  { path: 'buscar', component: Search, canActivate: [MsalGuard] },
  { path: 'playlists', component: Playlists, canActivate: [MsalGuard] },
  { path: 'playlists/:id', component: PlaylistDetail, canActivate: [MsalGuard] },
  { path: 'likes', component: Likes, canActivate: [MsalGuard] },
  { path: '**', redirectTo: '' },
];
