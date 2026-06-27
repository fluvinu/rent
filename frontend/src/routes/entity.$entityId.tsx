import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import {
  api,
  type EntityRecord,
  type EntityType,
  type FieldDef,
} from "@/lib/api";
import {
  Edit,
  Plus,
  Trash2,
  LayoutGrid,
  Table2,
  Kanban,
  CalendarDays,
  BarChart2,
  Settings,
  Download,
} from "lucide-react";
import { FieldInput } from "@/components/FieldInput";
import { KanbanView } from "@/components/KanbanView";
import { CalendarView } from "@/components/CalendarView";
import { GalleryView } from "@/components/GalleryView";
import { AppShell } from "@/components/AppShell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/entity/$entityId")({
  validateSearch: z.object({
    parentRecordId: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Records — AppBuilder" }] }),
  component: EntityPage,
});

function EntityPage() {
  const { entityId } = Route.useParams();
  const searchParams = Route.useSearch();

  const { token, ready } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState<EntityType | null>(null);
  const [records, setRecords] = useState<EntityRecord[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<EntityRecord | null>(null);

  const load = () => {
    api<EntityType>(`/api/entity-types/${entityId}`)
      .then(setType)
      .catch((e) => setError(e.message));
    api<EntityRecord[]>(`/api/records/entity/${entityId}`)
      .then((d) => setRecords(Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message));
  };

  useEffect(load, [entityId]);

  const deleteRecord = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    try {
      await api(`/api/records/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      setRecords((r) => (r ? r.filter((x) => x.id !== id) : r));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteDataset = async () => {
    if (!confirm("Delete this entire entity type and all records?")) return;
    try {
      await api(`/api/entity-types/${entityId}`, { method: "DELETE" });
      toast.success("Deleted dataset");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const exportCSV = () => {
    if (!type || !records) return;
    const fields = type.fields;
    const headers = ["ID", ...fields.map((f) => f.name)];
    const rows = records.map((r) =>
      [
        r.id,
        ...fields.map((f) => {
          const val = r.data[f.key || f.name];
          if (val === null || val === undefined) return "";
          if (typeof val === "object") return JSON.stringify(val);
          return String(val).replace(/"/g, '""');
        }),
      ]
        .map((v) => `"${v}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type.name.toLowerCase().replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRecords = records
    ? records.filter((r) => {
        if (searchParams.parentRecordId && r.parentRecordId !== searchParams.parentRecordId) return false;
        if (!search) return true;
        return Object.values(r.data || {}).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase()),
        );
      })
    : null;

  const openNew = () => {
    setEditRecord(null);
    setOpen(true);
  };

  return (
    <AppShell>
      <div className="p-6 max-w-full">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {type?.name || "Loading..."}
            </h1>
            {type?.description && (
              <p className="text-muted-foreground text-sm mt-1">
                {type.description}
              </p>
            )}
            {records !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                {records.length} record{records.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={!records}>
              <Download className="size-4 mr-2" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/entity/edit/${entityId}`}>
                <Settings className="size-4 mr-2" /> Schema
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={deleteDataset} className="text-destructive hover:text-destructive">
              <Trash2 className="size-4 mr-2" /> Delete
            </Button>
            <Button onClick={openNew} disabled={!type}>
              <Plus className="size-4 mr-2" /> New Record
            </Button>
          </div>
        </div>

        {searchParams.parentRecordId && (
          <div className="rounded-md border border-blue-500/50 bg-blue-50 text-blue-700 text-sm p-3 mb-4 flex items-center justify-between">
            <span>Viewing records filtered by parent: {searchParams.parentRecordId.slice(-6)}</span>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: `/entity/${type?.id}` })}>
              Clear Filter
            </Button>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/5 text-destructive text-sm p-4 mb-4">
            {error}
          </div>
        )}

        <Tabs defaultValue="table" className="w-full">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <TabsList>
              <TabsTrigger value="table" className="gap-1.5">
                <Table2 className="size-3.5" /> Table
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-1.5">
                <Kanban className="size-3.5" /> Kanban
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1.5">
                <CalendarDays className="size-3.5" /> Calendar
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-1.5">
                <LayoutGrid className="size-3.5" /> Gallery
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-1.5">
                <BarChart2 className="size-3.5" /> Charts
              </TabsTrigger>
            </TabsList>
            <Input
              className="max-w-xs h-8 text-sm"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <TabsContent value="table" className="mt-0">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {type?.fields?.filter(f => !f.isHidden).map((f) => (
                      <TableHead key={f.name}>{f.name}</TableHead>
                    ))}
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!filteredRecords && (
                    <TableRow>
                      <TableCell
                        colSpan={(type?.fields?.filter(f => !f.isHidden).length || 1) + 1}
                        className="text-center text-muted-foreground py-12"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredRecords && filteredRecords.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={(type?.fields?.filter(f => !f.isHidden).length || 1) + 1}
                        className="text-center text-muted-foreground py-12"
                      >
                        {search ? "No records match your search." : "No records yet. Create one to get started."}
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredRecords?.map((r) => (
                    <TableRow key={r.id} className="group">
                      {type?.fields?.filter(f => !f.isHidden).map((f) => (
                        <TableCell key={f.name}>
                          {renderCell(r.data?.[f.key || f.name], f)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => {
                              setEditRecord(r);
                              setOpen(true);
                            }}
                          >
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => deleteRecord(r.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="kanban" className="mt-0">
            {type && filteredRecords !== null && (
              <KanbanView
                type={type}
                records={filteredRecords}
                onEdit={(r) => { setEditRecord(r); setOpen(true); }}
                onDelete={deleteRecord}
                onNew={openNew}
              />
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            {type && filteredRecords !== null && (
              <CalendarView
                type={type}
                records={filteredRecords}
                onEdit={(r) => { setEditRecord(r); setOpen(true); }}
                onNew={openNew}
              />
            )}
          </TabsContent>

          <TabsContent value="gallery" className="mt-0">
            {type && filteredRecords !== null && (
              <GalleryView
                type={type}
                records={filteredRecords}
                onEdit={(r) => { setEditRecord(r); setOpen(true); }}
                onDelete={deleteRecord}
                onNew={openNew}
              />
            )}
          </TabsContent>

          <TabsContent value="charts" className="mt-0">
            {type && filteredRecords && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {type.fields
                  .filter((f) => !f.isHidden && ["NUMBER", "BOOLEAN", "SELECT"].includes(f.type))
                  .map((f) => (
                    <div key={f.name} className="border rounded-lg p-4">
                      <h3 className="text-sm font-medium mb-4 text-center">{f.name}</h3>
                      <div className="h-[260px] w-full">
                        {f.type === "NUMBER"
                          ? renderBarChart(f, filteredRecords)
                          : renderPieChart(f, filteredRecords)}
                      </div>
                    </div>
                  ))}
                {type.fields.filter((f) =>
                  !f.isHidden && ["NUMBER", "BOOLEAN", "SELECT"].includes(f.type),
                ).length === 0 && (
                  <div className="col-span-2 text-center text-muted-foreground py-16 border rounded-lg border-dashed">
                    Add a Number, Boolean, or Select field to see charts.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {type && (
        <RecordDialog
          open={open}
          onOpenChange={setOpen}
          type={type}
          editRecord={editRecord}
          defaultParentRecordId={searchParams.parentRecordId}
          onCreated={() => {
            setOpen(false);
            load();
          }}
        />
      )}
    </AppShell>
  );
}

function renderCell(value: any, f: FieldDef) {
  if (value === undefined || value === null || value === "")
    return <span className="text-muted-foreground text-xs">—</span>;
  if (f.type === "BOOLEAN")
    return (
      <Badge variant={value ? "default" : "secondary"} className="text-xs">
        {value ? "Yes" : "No"}
      </Badge>
    );
  if (f.type === "MULTI_SELECT" && Array.isArray(value))
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v) => (
          <Badge key={v} variant="outline" className="text-xs">
            {v}
          </Badge>
        ))}
      </div>
    );
  if (f.type === "SELECT")
    return <Badge variant="outline" className="text-xs">{String(value)}</Badge>;
  if (typeof value === "object")
    return <code className="text-xs text-muted-foreground">{JSON.stringify(value)}</code>;
  const str = String(value);
  return <span className="text-sm">{str.length > 60 ? str.slice(0, 60) + "…" : str}</span>;
}

const COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444"];

function renderBarChart(f: FieldDef, records: EntityRecord[]) {
  const data = records.map((r, i) => ({
    name: `#${i + 1}`,
    value: Number(r.data[f.key || f.name]) || 0,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" hide={data.length > 20} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="value" fill="#6366f1" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderPieChart(f: FieldDef, records: EntityRecord[]) {
  const counts: Record<string, number> = {};
  records.forEach((r) => {
    const val = String(r.data[f.key || f.name] ?? "Unknown");
    counts[val] = (counts[val] || 0) + 1;
  });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={e => e.name}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RecordDialog({
  open, onOpenChange, type, editRecord, onCreated, defaultParentRecordId
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: EntityType;
  editRecord?: EntityRecord | null;
  onCreated: () => void;
  defaultParentRecordId?: string;
}) {
  const [data, setData] = useState<Record<string, any>>({});
  const [parentRecordId, setParentRecordId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Sub-records state
  const [subRecords, setSubRecords] = useState<Record<string, { type: EntityType, records: EntityRecord[] }>>({});

  // Create Sub-record state
  const [creatingSubType, setCreatingSubType] = useState<EntityType | null>(null);

  useEffect(() => {
    if (open) {
      setData(editRecord ? { ...editRecord.data } : {});
      setParentRecordId(editRecord?.parentRecordId || defaultParentRecordId || "");

      if (editRecord?.id && type.subEntityTypes && type.subEntityTypes.length > 0) {
        // Fetch all parent's child records once
        api<EntityRecord[]>(`/api/records/parent/${editRecord.id}`).then(allRecords => {
          Promise.all(
            type.subEntityTypes!.map(async (subTypeId) => {
              try {
                const subType = await api<EntityType>(`/api/entity-types/${subTypeId}`);
                const filteredRecords = allRecords.filter(r => r.entityTypeId === subTypeId);
                return { subTypeId, data: { type: subType, records: filteredRecords } };
              } catch (e) {
                console.error(`Failed to load sub-entity ${subTypeId}`, e);
                return null;
              }
            })
          ).then(results => {
            const newSubRecords: Record<string, { type: EntityType, records: EntityRecord[] }> = {};
            results.forEach(res => {
              if (res) newSubRecords[res.subTypeId] = res.data;
            });
            setSubRecords(newSubRecords);
          });
        }).catch(err => {
          console.error("Failed to fetch sub records", err);
        });
      } else {
        setSubRecords({});
      }
    }
  }, [open, editRecord, type, defaultParentRecordId]);

  const reloadSubRecords = () => {
    if (editRecord?.id && type.subEntityTypes && type.subEntityTypes.length > 0) {
      api<EntityRecord[]>(`/api/records/parent/${editRecord.id}`).then(allRecords => {
        Promise.all(
          type.subEntityTypes!.map(async (subTypeId) => {
            try {
              const subType = await api<EntityType>(`/api/entity-types/${subTypeId}`);
              const filteredRecords = allRecords.filter(r => r.entityTypeId === subTypeId);
              return { subTypeId, data: { type: subType, records: filteredRecords } };
            } catch (e) {
              console.error(`Failed to load sub-entity ${subTypeId}`, e);
              return null;
            }
          })
        ).then(results => {
          const newSubRecords: Record<string, { type: EntityType, records: EntityRecord[] }> = {};
          results.forEach(res => {
            if (res) newSubRecords[res.subTypeId] = res.data;
          });
          setSubRecords(newSubRecords);
        });
      });
    }
  };

  const update = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of type.fields) {
      if (f.required && (data[f.key || f.name] === undefined || data[f.key || f.name] === "" || data[f.key || f.name] === null)) {
        return toast.error(`${f.name} is required`);
      }
    }
    setSaving(true);
    try {
      const payloadParentId = parentRecordId.trim() || undefined;
      if (editRecord && editRecord.id) {
        await api(`/api/records/${editRecord.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...editRecord, data, parentRecordId: payloadParentId }),
        });
        toast.success("Record updated");
      } else {
        await api(`/api/records/entity/${type.id}`, {
          method: "POST",
          body: JSON.stringify({ data, parentRecordId: payloadParentId }),
        });
        toast.success("Record created");
      }
      onCreated();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val && editRecord) onCreated(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRecord ? "Edit" : "New"} {type.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {type.fields.filter(f => !f.isHidden).map((f) => (
            <FieldInput key={f.name} field={f} value={data[f.key || f.name]} onChange={(v) => update(f.key || f.name, v)} />
          ))}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Parent Record ID (Optional)</Label>
            <Input
              value={parentRecordId}
              onChange={(e) => setParentRecordId(e.target.value)}
              placeholder="Leave empty for top-level record"
              className="h-8 text-sm"
            />
          </div>

          {editRecord && Object.keys(subRecords).length > 0 && (
            <div className="mt-6 space-y-4 border-t pt-4">
              <h3 className="font-medium">Sub-Records</h3>
              {Object.values(subRecords).map(({ type: subType, records }) => (
                <div key={subType.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{subType.name}</span>
                    <div className="flex items-center gap-2">
                      <Link to={`/entity/${subType.id}`} search={{ parentRecordId: editRecord.id }} className="text-blue-500 hover:underline text-xs">
                        View All
                      </Link>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setCreatingSubType(subType)}>
                        <Plus className="size-3.5 mr-1" /> New
                      </Button>
                    </div>
                  </div>
                  {records.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No {subType.name.toLowerCase()}s found.</p>
                  ) : (
                    <div className="space-y-2">
                      {records.map(r => (
                        <div key={r.id} className="text-xs flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="truncate pr-2">
                            {r.id.slice(-6)}: {Object.values(r.data)[0] ? String(Object.values(r.data)[0]) : "Untitled"}
                          </span>
                          <Link to={`/entity/${subType.id}`} search={{ parentRecordId: editRecord.id }} className="text-blue-500 hover:underline shrink-0">
                            View
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => { onOpenChange(false); if (editRecord) onCreated(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {creatingSubType && (
        <RecordDialog
          open={!!creatingSubType}
          onOpenChange={(val) => { if (!val) setCreatingSubType(null); }}
          type={creatingSubType}
          defaultParentRecordId={editRecord?.id}
          onCreated={() => {
            setCreatingSubType(null);
            reloadSubRecords();
          }}
        />
      )}
    </Dialog>
  );
}
