import { computed, inject, Injectable, signal } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AccountInfo, InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly msal = inject(MsalService);
  private readonly broadcast = inject(MsalBroadcastService);

  readonly account = signal<AccountInfo | null>(null);
  readonly displayName = computed(() => {
    const current = this.account();
    return (
      (current?.name as string | undefined) ||
      current?.username ||
      'Usuario'
    );
  });
  readonly loggedIn = computed(() => this.account() !== null);

  constructor() {
    this.msal.initialize().subscribe(() => {
      this.msal.handleRedirectObservable().subscribe();
    });
    this.broadcast.inProgress$
      .pipe(filter((status) => status === InteractionStatus.None))
      .subscribe(() => this.syncAccount());
  }

  login(): void {
    this.msal.loginRedirect({ scopes: environment.apiScopes });
  }

  logout(): void {
    this.msal.logoutRedirect();
  }

  private syncAccount(): void {
    const accounts = this.msal.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.msal.instance.setActiveAccount(accounts[0]);
      this.account.set(accounts[0]);
      return;
    }
    this.account.set(null);
  }
}
