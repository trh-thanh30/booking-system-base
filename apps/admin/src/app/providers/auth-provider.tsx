"use client";

import type { CurrentAuthUser, LoginInput } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/src/services/auth.service";
import {
  clearAccessToken,
  getAccessToken,
  setTenantId,
  setAccessToken,
} from "@/src/lib/auth-token";
import {
  ADMIN_SESSION_EXPIRED_EVENT,
  hasAdminRefreshCookie,
  refreshAdminAccessToken,
} from "@/src/lib/api-client";
import {
  AUTH_PROFILE_QUERY_KEY,
  canAccess,
  createAdminSession,
} from "@/src/lib/admin-session";
import { useAdminUiStore } from "@/src/app/stores/ui.store";

type AuthContextValue = {
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<CurrentAuthUser>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<CurrentAuthUser | null>;
  selectBusiness: (id: string) => void;
  user: CurrentAuthUser | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<CurrentAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const session = useMemo(
    () =>
      createAdminSession({
        hasRefreshMarker: hasAdminRefreshCookie,
        getAccessToken,
        refresh: refreshAdminAccessToken,
        getMe: authService.getMe,
        login: authService.loginAdmin,
        logout: authService.logout,
        setAccessToken,
        clearCredentials: clearAccessToken,
        getActiveBusinessId: () => useAdminUiStore.getState().activeBusinessId,
        clearCache: () => {
          void queryClient.cancelQueries();
          queryClient.clear();
          useAdminUiStore.getState().setCommandOpen(false);
        },
        setContext: (profile, businessId) => {
          setUser(profile);
          setTenantId(profile?.tenant_id);
          useAdminUiStore.getState().setActiveBusinessId(businessId);
          if (profile)
            queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, profile);
        },
      }),
    [queryClient],
  );

  useEffect(() => {
    let mounted = true;
    const handleExpired = () => session.clear();
    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleExpired);
    void session.bootstrap().finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => {
      mounted = false;
      window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleExpired);
    };
  }, [session]);

  const selectBusiness = useCallback(
    (id: string) => {
      if (
        !user?.businesses.some(
          (business) =>
            business.id === id && business.tenant_id === user.tenant_id,
        )
      )
        return;
      if (useAdminUiStore.getState().activeBusinessId === id) return;
      void queryClient.cancelQueries();
      useAdminUiStore.getState().setActiveBusinessId(id);
      void queryClient.resetQueries({
        predicate: (query) =>
          !(query.queryKey[0] === "admin" && query.queryKey[1] === "auth"),
      });
    },
    [queryClient, user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      can: (permission) => canAccess(user, permission),
      canAny: (permissions) =>
        permissions.some((permission) => canAccess(user, permission)),
      isAdmin: user?.role === "OWNER",
      isAuthenticated: Boolean(user),
      isLoading,
      login: session.login,
      logout: session.logout,
      refreshCurrentUser: session.refreshCurrentUser,
      selectBusiness,
      user,
    }),
    [isLoading, session, selectBusiness, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
