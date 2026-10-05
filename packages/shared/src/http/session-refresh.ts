import { createSingleFlight } from "./single-flight.ts";

export type CreateSessionRefreshOptions = {
  hasRefreshMarker: () => boolean;
  requestAccessToken: () => Promise<string | undefined>;
  onAccessToken: (accessToken: string) => void;
  onSessionExpired: () => void;
  getSessionVersion?: () => unknown;
};

export function createSessionRefresh(options: CreateSessionRefreshOptions) {
  return createSingleFlight(async (): Promise<string | false> => {
    const version = options.getSessionVersion?.();
    if (!options.hasRefreshMarker()) {
      options.onSessionExpired();
      return false;
    }

    try {
      const accessToken = await options.requestAccessToken();
      if (options.getSessionVersion?.() !== version) return false;

      if (!accessToken) {
        options.onSessionExpired();
        return false;
      }

      options.onAccessToken(accessToken);
      return accessToken;
    } catch {
      if (options.getSessionVersion?.() === version) options.onSessionExpired();
      return false;
    }
  });
}
