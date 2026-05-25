"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ApiUser } from "@/lib/api-types";
import axios from "axios";
import {
  apiAdminLogin,
  apiLogin,
  apiMe,
  apiMeAdmin,
  apiRegister,
  getStoredAccessToken,
  getStoredAdminAccessToken,
  setStoredAccessToken,
  setStoredAdminAccessToken,
} from "@/lib/api";

const ADMIN_USER_STORAGE_KEY = "hb_admin_user";

interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  isReady: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    role?: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;

  adminUser: ApiUser | null;
  adminToken: string | null;
  loginAdmin: (username: string, password: string) => Promise<void>;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readAdminUserFromStorage(): ApiUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

function writeAdminUserToStorage(user: ApiUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);

  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<ApiUser | null>(null);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setToken(getStoredAccessToken());
    setAdminToken(getStoredAdminAccessToken());
    setAdminUser(readAdminUserFromStorage());
    setIsReady(true);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = getStoredAccessToken();
    if (!t) {
      setUser(null);
      return;
    }
    try {
      const me = await apiMe();
      setUser(me);
    } catch {
      setUser(null);
      setStoredAccessToken(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (token) void refreshUser();
    else setUser(null);
  }, [isReady, token, refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin({ username, password });
    setStoredAccessToken(res.access_token);
    setToken(res.access_token);
    if (res.user) {
      setUser(res.user);
      return;
    }
    try {
      const me = await apiMe();
      setUser(me);
    } catch {
      setUser({ username });
    }
  }, []);

  const register = useCallback(
    async (username: string, password: string, role?: string) => {
      await apiRegister({ username, password, ...(role ? { role } : {}) });
      await login(username, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    setStoredAccessToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const loginAdmin = useCallback(async (username: string, password: string) => {
    const res = await apiAdminLogin({ username, password });
    setStoredAdminAccessToken(res.access_token);
    setAdminToken(res.access_token);
    const nextUser = res.user ?? (await apiMeAdmin());
    setAdminUser(nextUser);
    writeAdminUserToStorage(nextUser);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!adminToken) {
      setAdminUser(null);
      writeAdminUserToStorage(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await apiMeAdmin();
        if (!cancelled) {
          setAdminUser(me);
          writeAdminUserToStorage(me);
        }
      } catch (err) {
        const unauthorized =
          axios.isAxiosError(err) &&
          (err.response?.status === 401 || err.response?.status === 403);
        if (!cancelled && unauthorized) {
          setStoredAdminAccessToken(null);
          setAdminToken(null);
          setAdminUser(null);
          writeAdminUserToStorage(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, adminToken]);

  const logoutAdmin = useCallback(() => {
    setStoredAdminAccessToken(null);
    setAdminToken(null);
    setAdminUser(null);
    writeAdminUserToStorage(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      login,
      register,
      logout,
      refreshUser,
      adminUser,
      adminToken,
      loginAdmin,
      logoutAdmin,
    }),
    [
      user,
      token,
      isReady,
      login,
      register,
      logout,
      refreshUser,
      adminUser,
      adminToken,
      loginAdmin,
      logoutAdmin,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
