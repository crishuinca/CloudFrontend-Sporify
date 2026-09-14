import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { EMPTY, filter, switchMap, take } from 'rxjs';

import { environment } from '../../environments/environment';

export const apiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const msal = inject(MsalService);
  const broadcast = inject(MsalBroadcastService);

  return broadcast.inProgress$.pipe(
    filter((status) => status === InteractionStatus.None),
    take(1),
    switchMap(() => {
      const account =
        msal.instance.getActiveAccount() ?? msal.instance.getAllAccounts()[0] ?? null;
      if (!account) {
        return next(req);
      }
      msal.instance.setActiveAccount(account);
      return msal
        .acquireTokenSilent({
          account,
          scopes: environment.apiScopes,
        })
        .pipe(
          switchMap((result) =>
            next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${result.accessToken}` },
              }),
            ),
          ),
        );
    }),
  );
};
