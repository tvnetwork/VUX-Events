export const AUTH_DIALOG_EVENT = 'vux:open-auth-dialog';

export function requestAuthDialog() {
  window.dispatchEvent(new Event(AUTH_DIALOG_EVENT));
}
