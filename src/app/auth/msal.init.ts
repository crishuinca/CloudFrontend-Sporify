import { inject } from '@angular/core';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { IPublicClientApplication } from '@azure/msal-browser';

export function initializeMsal(): Promise<void> {
  const instance = inject(MSAL_INSTANCE) as IPublicClientApplication;
  return instance.initialize().then(() => instance.handleRedirectPromise()).then((result) => {
    if (result?.account) {
      instance.setActiveAccount(result.account);
      return;
    }
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
    }
  });
}
