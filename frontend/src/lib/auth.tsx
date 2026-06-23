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
  domain?: string;
}

export interface PublicProfile {
  id: string;
  tenantName: string;
  headingName?: string;
  domain?: string;
  logoUrl?: string;
}

interface AuthCtx {
  token: string | null;
  ready: boolean;
  profile: Profile | null;
  publicProfile: PublicProfile | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    domain?: string,
  ) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTok] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(
    null,
  );

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
    let isMounted = true;

    // Check for token in URL (from OAuth login)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        setToken(urlToken);
        // Remove token from URL for cleaner history
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    setTok(getToken());

    const initAuth = async () => {
      const hostname = window.location.hostname;

      const p1 = loadProfile();
      let p2 = Promise.resolve();

      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        p2 = api<PublicProfile>(
          `/api/tenant/public/current?domain=${encodeURIComponent(hostname)}`,
        )
          .then((data) => {
            if (isMounted) setPublicProfile(data);
          })
          .catch((e) => console.log("No public profile for domain", hostname));
      }

      await Promise.all([p1, p2]);

      if (isMounted) {
        setReady(true);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [loadProfile]);

  const doLogin = useCallback(
    async (username: string, password: string) => {
      const res = await api<{
        token?: string;
        accessToken?: string;
        jwt?: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const t = res.token || res.accessToken || res.jwt || null;
      if (!t) throw new Error("No token returned");
      setToken(t);
      setTok(t);
      await loadProfile();
    },
    [loadProfile],
  );

  const doRegister = useCallback(
    async (username: string, password: string, domain?: string) => {
      // Backend register returns the user (no token). Auto-login after.
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          tenantName: username,
          domain,
        }),
      });
      await doLogin(username, password);
    },
    [doLogin],
  );

  const value: AuthCtx = {
    token,
    ready,
    profile,
    publicProfile,
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
