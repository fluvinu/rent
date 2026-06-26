import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { api, type EntityType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Database,
  Zap,
  Package,
  Settings,
  LogOut,
  Plus,
  Layers,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AppShellProps {
  children: ReactNode;
  entityTypes?: EntityType[];
  onEntityTypesChange?: (types: EntityType[]) => void;
}

export function AppShell({ children }: AppShellProps) {
  const { token, ready, logout, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [types, setTypes] = useState<EntityType[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entitiesExpanded, setEntitiesExpanded] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (ready && !token) navigate({ to: "/" });
  }, [ready, token, navigate]);

  const loadTypes = () => {
    if (token) {
      api<EntityType[]>("/api/entity-types")
        .then((d) => setTypes(Array.isArray(d) ? d : []))
        .catch(console.error);
    }
  };

  useEffect(() => {
    loadTypes();
  }, [token]);

  if (!ready || !token) return <div className="min-h-screen bg-background" />;

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 border-r bg-card flex flex-col transition-transform duration-200",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-14 border-b flex items-center px-4 gap-2 flex-shrink-0">
          <div className="size-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <Layers className="size-4" />
          </div>
          <span className="font-semibold text-sm truncate">
            {profile?.headingName || "AppBuilder"}
          </span>
          <button
            className="ml-auto lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard className="size-4" />}
            label="Dashboard"
            onClick={() => setSidebarOpen(false)}
          />
          <NavItem
            to="/workflows"
            icon={<Zap className="size-4" />}
            label="Workflows"
            onClick={() => setSidebarOpen(false)}
          />
          <NavItem
            to="/templates"
            icon={<Package className="size-4" />}
            label="App Templates"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="pt-3 pb-1 px-2">
            <button
              className="flex items-center justify-between w-full group"
              onClick={() => setEntitiesExpanded((v) => !v)}
            >
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Entities
              </span>
              <div className="flex items-center gap-1">
                <Link
                  to="/entity/create"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(false);
                  }}
                >
                  <div className="size-5 flex items-center justify-center rounded hover:bg-muted">
                    <Plus className="size-3 text-muted-foreground" />
                  </div>
                </Link>
                <ChevronDown
                  className={cn(
                    "size-3 text-muted-foreground transition-transform",
                    !entitiesExpanded && "-rotate-90",
                  )}
                />
              </div>
            </button>
          </div>

          {entitiesExpanded && (
            <>
              {types.map((t) => (
                <NavItem
                  key={t.id}
                  to={`/entity/${t.id}`}
                  icon={<Database className="size-4" />}
                  label={t.name}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
              {types.length === 0 && (
                <Link
                  to="/entity/create"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="px-2 py-2 text-xs text-muted-foreground flex items-center gap-2 rounded hover:bg-muted">
                    <Plus className="size-3" /> New entity type
                  </div>
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="p-2 border-t space-y-0.5 flex-shrink-0">
          <button
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted text-muted-foreground"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-4" /> Settings
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted text-muted-foreground"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b flex items-center px-4 lg:hidden flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <span className="ml-2 font-semibold">
            {profile?.headingName || "AppBuilder"}
          </span>
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSaved={() => {
          refreshProfile();
          loadTypes();
        }}
      />
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  const state = useRouterState();
  const pathname = state.location.pathname;
  const isActive =
    pathname === to ||
    (to.startsWith("/entity/") &&
      pathname.startsWith(to) &&
      to !== "/entity/create");

  return (
    <Link to={to} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {icon}
        <span className="truncate">{label}</span>
      </div>
    </Link>
  );
}

function SettingsDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoUrl(ev.target?.result as string);
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
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>App Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>App Name</Label>
            <Input
              value={headingName}
              onChange={(e) => setHeadingName(e.target.value)}
              placeholder="My App"
            />
          </div>
          <div className="space-y-2">
            <Label>Custom Domain (Optional)</Label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="myapp.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <Input type="file" accept="image/*" onChange={handleFile} />
            {logoUrl && (
              <div className="border rounded p-2 flex justify-center bg-muted/20">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="max-h-16 object-contain"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
