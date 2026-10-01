import type { AuthSession, CurrentAuthUser, LoginInput } from "@repo/shared";

type SessionOptions = {
  hasRefreshMarker: () => boolean;
  getAccessToken: () => string | undefined;
  refresh: () => Promise<string | false>;
  getMe: () => Promise<CurrentAuthUser>;
  login: (input: LoginInput) => Promise<AuthSession>;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
  clearCredentials: () => void;
  getActiveBusinessId: () => string | null;
  setContext: (user: CurrentAuthUser | null, businessId: string | null) => void;
  clearCache: () => void;
};

export const AUTH_PROFILE_QUERY_KEY = ["admin", "auth", "me"] as const;

export function canAccess(user: CurrentAuthUser | null, permission: string) {
  if (!user || (user.role !== "OWNER" && user.role !== "STAFF")) return false;
  const [resource, action] = permission.split(":");
  return (
    user.role === "OWNER" ||
    user.permissions.includes("*") ||
    user.permissions.includes(permission) ||
    Boolean(
      resource && action && user.permissions.includes(`${resource}:manage`),
    )
  );
}

export function createAdminSession(options: SessionOptions) {
  let generation = 0;
  let currentUser: CurrentAuthUser | null = null;
  let bootstrapPromise: Promise<CurrentAuthUser | null> | undefined;

  function clear() {
    generation++;
    currentUser = null;
    options.clearCredentials();
    options.clearCache();
    options.setContext(null, null);
  }

  function apply(user: CurrentAuthUser) {
    if (
      (user.role !== "OWNER" && user.role !== "STAFF") ||
      !user.tenant_id ||
      user.tenant?.id !== user.tenant_id ||
      user.tenant.status !== "ACTIVE" ||
      user.status !== "ACTIVE" ||
      !user.is_verified
    ) {
      throw new Error("ADMIN_PROFILE_INVALID");
    }
    if (
      currentUser?.id !== user.id ||
      currentUser?.tenant_id !== user.tenant_id
    ) {
      options.clearCache();
    }
    const businesses = user.businesses.filter(
      (business) => business.tenant_id === user.tenant_id,
    );
    const active = options.getActiveBusinessId();
    const businessId =
      businesses.find((business) => business.id === active)?.id ??
      businesses.find((business) => business.is_default)?.id ??
      businesses[0]?.id ??
      null;
    if (currentUser && active !== businessId) options.clearCache();
    currentUser = { ...user, businesses };
    options.setContext(currentUser, businessId);
    return currentUser;
  }

  async function refreshCurrentUser() {
    const requestGeneration = generation;
    try {
      const user = await options.getMe();
      return requestGeneration === generation ? apply(user) : null;
    } catch (error) {
      if (
        requestGeneration === generation &&
        error instanceof Error &&
        error.message === "ADMIN_PROFILE_INVALID"
      )
        clear();
      throw error;
    }
  }

  return {
    clear,
    bootstrap() {
      if (bootstrapPromise) return bootstrapPromise;
      const requestGeneration = generation;
      bootstrapPromise = (async () => {
        try {
          if (!options.getAccessToken()) {
            options.clearCredentials();
            if (!options.hasRefreshMarker()) {
              clear();
              return null;
            }
            if (!(await options.refresh())) {
              if (requestGeneration === generation) clear();
              return null;
            }
          }
          const user = await options.getMe();
          return requestGeneration === generation ? apply(user) : null;
        } catch {
          if (requestGeneration === generation) clear();
          return null;
        }
      })().finally(() => {
        bootstrapPromise = undefined;
      });
      return bootstrapPromise;
    },
    async login(input: LoginInput) {
      const requestGeneration = ++generation;
      const result = await options.login(input);
      if (requestGeneration !== generation)
        throw new Error("ADMIN_SESSION_CANCELLED");
      options.setAccessToken(result.access_token);
      try {
        const user = await options.getMe();
        if (requestGeneration !== generation)
          throw new Error("ADMIN_SESSION_CANCELLED");
        return apply(user);
      } catch (error) {
        if (requestGeneration === generation) clear();
        throw error;
      }
    },
    refreshCurrentUser,
    async logout() {
      const request = options.logout();
      clear();
      await request;
    },
  };
}
