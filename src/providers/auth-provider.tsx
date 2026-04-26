"use client";

import * as React from "react";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastSolvedAt?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (name: string, adminKey?: string) => Promise<void>;
  loginAs: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AUTH_CACHE_KEY = "dsa-arena-auth";

function getCachedUser(): User | null {
  try {
    const raw = sessionStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function setCachedUser(user: User | null) {
  try {
    if (user) {
      sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_CACHE_KEY);
    }
  } catch {
    // sessionStorage unavailable
  }
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const setUserAndCache = React.useCallback((u: User | null) => {
    setUser(u);
    setCachedUser(u);
  }, []);

  const fetchUser = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.user) {
          setUserAndCache(json.data.user);
        }
      }
    } catch {
      // silently fail
    }
  }, [setUserAndCache]);

  React.useEffect(() => {
    let cancelled = false;

    const cached = getCachedUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }

    async function init() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (!cancelled && json.success && json.data?.user) {
            setUserAndCache(json.data.user);
          }
        } else if (!cancelled) {
          setUserAndCache(null);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [setUserAndCache]);

  const login = React.useCallback(async (name: string, adminKey?: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, adminKey }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || "Login failed");
    }

    setUserAndCache(json.data.user);
  }, [setUserAndCache]);

  const loginAs = React.useCallback(async (username: string) => {
    const res = await fetch("/api/auth/login-as", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to switch user");
    }

    setUserAndCache(json.data.user);
  }, [setUserAndCache]);

  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best-effort
    }
    setUserAndCache(null);
  }, [setUserAndCache]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
      login,
      loginAs,
      logout,
      refreshUser: fetchUser,
    }),
    [user, loading, login, loginAs, logout, fetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
