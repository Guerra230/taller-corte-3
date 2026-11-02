"use client";

import { createContext, useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { decodeJwtClaims, getExpiryMs, isTokenUsable, userFromClaims } from "@/lib/jwt";
import * as authService from "@/services/auth.service";
import { tokenStorage } from "@/services/token-storage";
import type { AuthStatus, LoginCredentials, RegisterOutcome, RegisterPayload, SessionUser } from "@/types/auth";

const MAX_TIMER_MS = 2 ** 31 - 1;

export interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterOutcome>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const getServerSnapshot = (): undefined => undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore<string | null | undefined>(tokenStorage.subscribe, tokenStorage.get, getServerSnapshot);

  const claims = useMemo(() => (token ? decodeJwtClaims(token) : null), [token]);
  const usable = token ? isTokenUsable(token) : false;

  useEffect(() => {
    if (token && !usable) tokenStorage.clear("expired");
  }, [token, usable]);

  useEffect(() => {
    const expiry = claims ? getExpiryMs(claims) : null;
    if (expiry === null) return;
    const delay = expiry - Date.now();
    if (delay > MAX_TIMER_MS) return;
    const timer = setTimeout(() => tokenStorage.clear("expired"), Math.max(delay, 0));
    return () => clearTimeout(timer);
  }, [claims]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    tokenStorage.set(await authService.login(credentials));
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<RegisterOutcome> => {
    const issuedToken = await authService.register(payload);
    if (!issuedToken) return "needs-login";
    tokenStorage.set(issuedToken);
    return "signed-in";
  }, []);

  const logout = useCallback(() => tokenStorage.clear("logout"), []);

  const value = useMemo<AuthContextValue>(() => {
    const status: AuthStatus = token === undefined ? "resolving" : usable ? "authenticated" : "anonymous";
    return {
      status,
      user: status === "authenticated" && claims ? userFromClaims(claims) : null,
      login,
      register,
      logout,
    };
  }, [token, usable, claims, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
