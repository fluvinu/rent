import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { BASE_URL } from "@/lib/api";
import { Layers } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AppBuilder — No-Code Platform" },
      { name: "description", content: "Build any management software without writing code." },
    ],
  }),
  component: Index,
});

function Index() {
  const { token, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && token) {
      navigate({ to: "/dashboard" });
    }
  }, [ready, token, navigate]);

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (token) return <div className="min-h-screen bg-background" />;

  return <AuthScreen />;
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
      toast.success(mode === "login" ? "Welcome back!" : "Account created!");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-muted">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-primary/5">
        <div className="max-w-md space-y-6">
          <div className="size-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
            <Layers className="size-7" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {publicProfile?.headingName || "AppBuilder"}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Build any management software — CRM, HR system, project manager, inventory — without writing a single line of code.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { label: "CRM", desc: "Contacts & Pipeline" },
              { label: "HR", desc: "Employees & Leave" },
              { label: "Projects", desc: "Tasks & Milestones" },
              { label: "Inventory", desc: "Products & Orders" },
            ].map((item) => (
              <div key={item.label} className="border rounded-lg p-3 bg-background/50">
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2 lg:hidden">
            {publicProfile?.logoUrl ? (
              <img src={publicProfile.logoUrl} alt="Logo" className="h-9 rounded" />
            ) : (
              <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Layers className="size-5" />
              </div>
            )}
            <span className="text-xl font-semibold">
              {publicProfile?.headingName || "AppBuilder"}
            </span>
          </div>

          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                {publicProfile?.tenantName
                  ? `Sign in to ${publicProfile.tenantName}`
                  : "Get started"}
              </CardTitle>
              <CardDescription>
                {mode === "login"
                  ? "Sign in to your account to continue."
                  : "Create a new account to start building."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                <TabsList className="grid grid-cols-2 w-full mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value={mode}>
                  <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        placeholder="your-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                      />
                    </div>
                    {mode === "register" && (
                      <div className="space-y-2">
                        <Label htmlFor="authDomain">Custom Domain (Optional)</Label>
                        <Input
                          id="authDomain"
                          value={authDomain}
                          onChange={(e) => setAuthDomain(e.target.value)}
                          placeholder="myapp.example.com"
                        />
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                    </Button>
                  </form>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `${BASE_URL}/oauth2/authorization/google`}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        <path d="M1 1h22v22H1z" fill="none"/>
                      </svg>
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `${BASE_URL}/oauth2/authorization/github`}
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
