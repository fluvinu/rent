import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { api, BASE_URL, type EntityType } from "../lib/api";
import { Database, LogOut, Plus, Layers, Zap, Settings } from "lucide-react";
import { QuickRecordDialog } from "@/components/QuickRecordDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rent — Dynamic Metadata Platform" },
      {
        name: "description",
        content:
          "Build dynamic entity schemas and manage records in real-time.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { token, ready } = useAuth();
  if (!ready) return <div className="min-h-screen bg-background" />;
  return token ? <Dashboard /> : <AuthScreen />;
}

function AuthScreen() {
  const { login, register, publicProfile } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authDomain, setAuthDomain] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      if (mode === "login") await login(username, password);
      else await register(username, password, authDomain);
      toast.success(mode === "login" ? "Welcome back" : "Account created");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          {publicProfile?.logoUrl ? (
            <img
              src={publicProfile.logoUrl}
              alt="Logo"
              className="h-10 max-w-[120px] object-contain rounded"
            />
          ) : (
            <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Layers className="size-5" />
            </div>
          )}
          <span className="text-2xl font-semibold tracking-tight">
            {publicProfile?.headingName || publicProfile?.tenantName || "Rent"}
          </span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              {publicProfile?.tenantName
                ? `Sign in to ${publicProfile.tenantName}`
                : "Dynamic Metadata Platform"}
            </CardTitle>
            <CardDescription>
              Sign in or create a tenant account to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value={mode} className="mt-4">
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                    />
                  </div>
                  {mode === "register" && (
                    <div className="space-y-2">
                      <Label htmlFor="authDomain">Domain (Optional)</Label>
                      <Input
                        id="authDomain"
                        value={authDomain}
                        onChange={(e) => setAuthDomain(e.target.value)}
                        placeholder="e.g. your-tenant.netlify.app"
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                      ? "Please wait..."
                      : mode === "login"
                        ? "Login"
                        : "Create account"}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `${BASE_URL}/oauth2/authorization/google`}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `${BASE_URL}/oauth2/authorization/github`}
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </div>

              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Dashboard() {
  const { logout, profile, publicProfile } = useAuth();
  const [types, setTypes] = useState<EntityType[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const displayProfile = profile || publicProfile;

  const load = () => {
    api<EntityType[]>("/api/entity-types")
      .then((data) => setTypes(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {displayProfile?.logoUrl ? (
              <img
                src={displayProfile.logoUrl}
                alt="Logo"
                className="h-8 max-w-[120px] object-contain rounded"
              />
            ) : (
              <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                <Layers className="size-4" />
              </div>
            )}
            <span className="font-semibold tracking-tight">
              {displayProfile?.headingName || "Rent"}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/workflow-guide">Workflow Guide</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="size-4 mr-2" /> Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="size-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Entity Types
            </h1>
            <p className="text-muted-foreground mt-1">
              Define schemas on the fly and manage records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setQuickOpen(true)}
              variant="secondary"
              disabled={!types}
            >
              <Zap className="size-4 mr-2" /> Quick Record
            </Button>
            <Button asChild>
              <Link to="/entity/create">
                <Plus className="size-4 mr-2" /> New Entity Type
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {!types && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-40 animate-pulse" />
            ))}
          </div>
        )}

        {types && types.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 flex flex-col items-center text-center">
              <Database className="size-10 text-muted-foreground mb-3" />
              <h3 className="font-medium">No entity types yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Create your first schema to get started.
              </p>
              <Button asChild>
                <Link to="/entity/create">
                  <Plus className="size-4 mr-2" />
                  Create Entity Type
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {types && types.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((t) => (
              <Link
                key={t.id}
                to="/entity/$entityId"
                params={{ entityId: t.id }}
                className="group"
              >
                <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <Database className="size-5" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t.fields?.length || 0} fields
                      </span>
                    </div>
                    <CardTitle className="mt-3">{t.name}</CardTitle>
                    {t.description && (
                      <CardDescription className="line-clamp-2">
                        {t.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {types && (
        <QuickRecordDialog
          open={quickOpen}
          onOpenChange={setQuickOpen}
          types={types}
          onCreated={load}
        />
      )}

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { profile, refreshProfile } = useAuth();
  const [headingName, setHeadingName] = useState("");
  const [domain, setDomain] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setHeadingName(profile.headingName || "");
      setDomain(profile.domain || "");
      setLogoUrl(profile.logoUrl || "");
    }
  }, [open, profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/tenant/profile", {
        method: "PUT",
        body: JSON.stringify({ headingName, domain, logoUrl }),
      });
      toast.success("Settings saved");
      await refreshProfile();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tenant Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="headingName">Heading Name</Label>
            <Input
              id="headingName"
              value={headingName}
              onChange={(e) => setHeadingName(e.target.value)}
              placeholder="e.g. Rent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Domain (Optional)</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. mytenant.rentis.netlify.app"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Upload Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {logoUrl && (
            <div className="mt-2 border rounded p-2 flex justify-center bg-muted/20">
              <img
                src={logoUrl}
                alt="Preview"
                className="max-h-20 object-contain"
              />
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
