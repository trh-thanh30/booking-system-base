"use client";

import type { CurrentAuthUser, LoginInput } from "@repo/shared";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/src/lib/auth-token";
import { authService } from "@/src/services/auth.service";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<CurrentAuthUser>;
  logout: () => Promise<void>;
  user: CurrentAuthUser | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function hasPlatformRefreshCookie() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith("platform_has_rt="));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        if (!getAccessToken() && hasPlatformRefreshCookie()) {
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
    const result = await authService.loginPlatform(input);
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

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      user,
    }),
    [isLoading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
