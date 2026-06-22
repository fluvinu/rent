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
import { api, type EntityType } from "@/lib/api";
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
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      if (mode === "login") await login(username, password);
      else await register(username, password);
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
             <img src={publicProfile.logoUrl} alt="Logo" className="h-10 max-w-[120px] object-contain rounded" />
          ) : (
             <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
               <Layers className="size-5" />
             </div>
          )}
          <span className="text-2xl font-semibold tracking-tight">{publicProfile?.headingName || publicProfile?.tenantName || "Rent"}</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{publicProfile?.tenantName ? `Sign in to ${publicProfile.tenantName}` : "Dynamic Metadata Platform"}</CardTitle>
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                      ? "Please wait..."
                      : mode === "login"
                        ? "Login"
                        : "Create account"}
                  </Button>
                </form>
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
