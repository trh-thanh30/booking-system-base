import { createSingleFlight } from "./single-flight.ts";

export type CreateSessionRefreshOptions = {
  hasRefreshMarker: () => boolean;
  requestAccessToken: () => Promise<string | undefined>;
  onAccessToken: (accessToken: string) => void;
  onSessionExpired: () => void;
};

export function createSessionRefresh(options: CreateSessionRefreshOptions) {
  return createSingleFlight(async (): Promise<string | false> => {
    if (!options.hasRefreshMarker()) {
      options.onSessionExpired();
      return false;
    }

    try {
      const accessToken = await options.requestAccessToken();

      if (!accessToken) {
        options.onSessionExpired();
        return false;
      }

      options.onAccessToken(accessToken);
      return accessToken;
    } catch {
      options.onSessionExpired();
      return false;
    }
  });
}
