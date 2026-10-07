import type {
  AuthSession,
  CurrentAuthUser,
  LoginInput,
  CompleteGoogleOwnerOnboardingInput,
  GoogleOwnerOnboardingResult,
} from "@repo/shared";

export function createGoogleOnboardingCompletion(
  complete: (
    input: CompleteGoogleOwnerOnboardingInput,
  ) => Promise<GoogleOwnerOnboardingResult>,
) {
  let pending: Promise<GoogleOwnerOnboardingResult> | undefined;
  return (input: CompleteGoogleOwnerOnboardingInput) => {
    pending ??= complete(input).finally(() => {
      pending = undefined;
    });
    return pending;
  };
}

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
  let bootstrapGeneration = 0;

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

  async function authenticate<T extends AuthSession>(
    request: () => Promise<T>,
    useResponseProfile: boolean,
  ) {
    const requestGeneration = ++generation;
    const result = await request();
    if (requestGeneration !== generation)
      throw new Error("ADMIN_SESSION_CANCELLED");
    if (typeof result.access_token !== "string" || !result.access_token) {
      clear();
      throw new Error("ADMIN_PROFILE_INVALID");
    }
    options.setAccessToken(result.access_token);
    try {
      const user = useResponseProfile ? result.user : await options.getMe();
      if (requestGeneration !== generation)
        throw new Error("ADMIN_SESSION_CANCELLED");
      return { ...result, user: apply(user) };
    } catch (error) {
      if (requestGeneration === generation) clear();
      throw error;
    }
  }

  function bootstrap(): Promise<CurrentAuthUser | null> {
    if (bootstrapPromise) {
      // A remounted provider must not adopt an earlier, cancelled restoration.
      // Wait for it to settle before requesting refresh again, since refresh is shared.
      const requestedGeneration = generation;
      return bootstrapGeneration === generation
        ? bootstrapPromise
        : bootstrapPromise.then(() =>
            requestedGeneration === generation ? bootstrap() : null,
          );
    }
    const requestGeneration = generation;
    bootstrapGeneration = requestGeneration;
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
  }

  return {
    clear,
    bootstrap,
    async login(input: LoginInput) {
      return (await authenticate(() => options.login(input), false)).user;
    },
    // Onboarding returns the same AuthProfileService profile as /auth/me. Adopt it once;
    // an extra profile request failure must not encourage replaying workspace creation.
    establishSession<T extends AuthSession>(request: () => Promise<T>) {
      return authenticate(request, true);
    },
    refreshCurrentUser,
    async logout() {
      const request = options.logout();
      clear();
      await request;
    },
  };
}
