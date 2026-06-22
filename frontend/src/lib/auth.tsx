import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, getToken, setToken } from "./api";

interface Profile {
  id: string;
  username: string;
  tenantName: string;
  logoUrl?: string;
  headingName?: string;
}

interface AuthCtx {
  token: string | null;
  ready: boolean;
  profile: Profile | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTok] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async () => {
    if (!getToken()) {
      setProfile(null);
      return;
    }
    try {
      const data = await api<Profile>("/api/tenant/profile");
      setProfile(data);
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  }, []);

  useEffect(() => {
    setTok(getToken());
    setReady(true);
    loadProfile();
  }, [loadProfile]);

  const doLogin = useCallback(async (username: string, password: string) => {
    const res = await api<{ token?: string; accessToken?: string; jwt?: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ username, password }) },
    );
    const t = res.token || res.accessToken || res.jwt || null;
    if (!t) throw new Error("No token returned");
    setToken(t);
    setTok(t);
    await loadProfile();
  }, [loadProfile]);

  const doRegister = useCallback(
    async (username: string, password: string) => {
      // Backend register returns the user (no token). Auto-login after.
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password, tenantName: username }),
      });
      await doLogin(username, password);
    },
    [doLogin],
  );

  const value: AuthCtx = {
    token,
    ready,
    profile,
    login: doLogin,
    register: doRegister,
    logout: () => {
      setToken(null);
      setTok(null);
      setProfile(null);
    },
    refreshProfile: loadProfile,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}