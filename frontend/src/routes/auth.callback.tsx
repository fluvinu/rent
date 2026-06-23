import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api, setToken } from "@/lib/api";
import { Layers } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  component: OAuthCallback,
});

function OAuthCallback() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (error) {
      toast.error("OAuth login was cancelled or failed.");
      navigate({ to: "/" });
      return;
    }

    if (!code || !state) {
      toast.error("Invalid OAuth callback.");
      navigate({ to: "/" });
      return;
    }

    const provider = state.startsWith("google") ? "google" : "github";
    const redirectUri = `${window.location.origin}/auth/callback`;

    api<{ token: string }>(`/auth/oauth/${provider}`, {
      method: "POST",
      body: JSON.stringify({ code, redirectUri }),
    })
      .then((res) => {
        setToken(res.token);
        window.location.href = "/";
      })
      .catch((err) => {
        toast.error(err.message || "SSO login failed");
        navigate({ to: "/" });
      });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted gap-4">
      <div className="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
        <Layers className="size-6" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
}
