"use client";

import type { LoginInput, CurrentAuthUser } from "@repo/shared";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "@/src/services/auth.service";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/src/lib/auth-token";

type AuthContextValue = {
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<CurrentAuthUser>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<CurrentAuthUser | null>;
  user: CurrentAuthUser | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function hasAdminRefreshCookie() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith("admin_has_rt="));
}

function canByManagePermission(permissions: string[], permission: string) {
  const [resource, action] = permission.split(":");

  if (!resource || !action) {
    return false;
  }

  return permissions.includes(`${resource}:manage`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
      return currentUser;
    } catch {
      clearAccessToken();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        if (!getAccessToken() && hasAdminRefreshCookie()) {
          const result = await authService.refresh();
          setAccessToken(result.access_token);
        }

        if (getAccessToken()) {
          const currentUser = await authService.getMe();
          if (mounted) {
            setUser(currentUser);
          }
        }
      } catch {
        clearAccessToken();
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const result = await authService.loginAdmin(input);
    setAccessToken(result.access_token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const permissions = user?.permissions ?? [];
    const isAdmin = permissions.includes("*") || user?.role === "ADMIN";

    return {
      can(permission) {
        return (
          isAdmin ||
          permissions.includes(permission) ||
          canByManagePermission(permissions, permission)
        );
      },
      canAny(targetPermissions) {
        return (
          isAdmin ||
          targetPermissions.some(
            (permission) =>
              permissions.includes(permission) ||
              canByManagePermission(permissions, permission),
          )
        );
      },
      isAdmin,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshCurrentUser,
      user,
    };
  }, [isLoading, login, logout, refreshCurrentUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
