import * as Sentry from '@sentry/react';

type AuthRole = 'client' | 'admin';

export function setSentryUser(id: number | string, email: string, role: AuthRole) {
  Sentry.setUser({ id: String(id), email, role });
}

export function clearSentryUser() {
  Sentry.setUser(null);
}
