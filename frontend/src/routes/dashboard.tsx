import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { api, type EntityType, type EntityRecord } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Plus, TrendingUp, ArrowRight, Zap } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AppBuilder" }] }),
  component: DashboardPage,
});

interface EntityStat {
  type: EntityType;
  count: number;
  records: EntityRecord[];
}

const COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444"];

function DashboardPage() {
  const [stats, setStats] = useState<EntityStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const types = await api<EntityType[]>("/api/entity-types");
        if (!Array.isArray(types) || types.length === 0) {
          setStats([]);
          setLoading(false);
          return;
        }
        const results = await Promise.all(
          types.map(async (type) => {
            try {
              const records = await api<EntityRecord[]>(`/api/records/entity/${type.id}`);
              return { type, count: Array.isArray(records) ? records.length : 0, records: Array.isArray(records) ? records : [] };
            } catch {
              return { type, count: 0, records: [] };
            }
          }),
        );
        setStats(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalRecords = stats.reduce((s, e) => s + e.count, 0);
  const entityCount = stats.length;

  const overviewData = stats.map((s) => ({ name: s.type.name, count: s.count }));

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your entire application.</p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Card key={i} className="h-28 animate-pulse" />)}
          </div>
        )}

        {!loading && stats.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-20 flex flex-col items-center text-center">
              <Database className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No entities yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-6">
                Create your first entity type to start building your app.
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Button asChild>
                  <Link to="/entity/create">
                    <Plus className="size-4 mr-2" /> Create Entity Type
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/templates">
                    <Zap className="size-4 mr-2" /> Use a Template
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && stats.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Records"
                value={totalRecords}
                icon={<TrendingUp className="size-4" />}
                color="text-indigo-600"
                bg="bg-indigo-50"
              />
              <StatCard
                title="Entity Types"
                value={entityCount}
                icon={<Database className="size-4" />}
                color="text-purple-600"
                bg="bg-purple-50"
              />
              {stats.slice(0, 2).map((s, i) => (
                <StatCard
                  key={s.type.id}
                  title={s.type.name}
                  value={s.count}
                  icon={<Database className="size-4" />}
                  color={["text-emerald-600","text-pink-600"][i]}
                  bg={["bg-emerald-50","bg-pink-50"][i]}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Records by Entity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overviewData} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Records" radius={[4,4,0,0]}>
                          {overviewData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overviewData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ name, percent }) =>
                            percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                          }
                        >
                          {overviewData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => [`${val} records`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">All Entities</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/entity/create">
                    <Plus className="size-4 mr-1" /> New Entity
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((s, i) => (
                  <Link key={s.type.id} to="/entity/$entityId" params={{ entityId: s.type.id }}>
                    <Card className="hover:border-primary/50 hover:shadow-md transition-all group">
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-10 rounded-lg flex items-center justify-center text-white"
                            style={{ background: COLORS[i % COLORS.length] }}
                          >
                            <Database className="size-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{s.type.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {s.count} record{s.count !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {s.type.description && (
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-1">{s.type.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({
  title, value, icon, color, bg,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className={`size-8 rounded-lg ${bg} ${color} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
