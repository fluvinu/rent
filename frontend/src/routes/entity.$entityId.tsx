import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { FieldInput } from "@/components/FieldInput";
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
  head: () => ({ meta: [{ title: "Records — Rent" }] }),
  component: EntityPage,
});

function EntityPage() {
  const { entityId } = Route.useParams();
  const { token, ready } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState<EntityType | null>(null);
  const [records, setRecords] = useState<EntityRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<EntityRecord | null>(null);

  useEffect(() => {
    if (ready && !token) navigate({ to: "/" });
  }, [ready, token, navigate]);

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
    if (
      !confirm(
        "Delete this entire dataset? All records and schema will be lost.",
      )
    )
      return;
    try {
      await api(`/api/entity-types/${entityId}`, { method: "DELETE" });
      toast.success("Dataset deleted");
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="font-semibold">{type?.name || "Loading..."}</h1>
          </div>
          {type && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/entity/edit/${entityId}`}>
                  <Edit className="size-4 mr-2" />
                  Edit Schema
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteDataset}>
                <Trash2 className="size-4 mr-2" />
                Delete Dataset
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Records</h2>
            {type?.description && (
              <p className="text-muted-foreground text-sm mt-1">
                {type.description}
              </p>
            )}
          </div>
          <Button onClick={() => setOpen(true)} disabled={!type}>
            <Plus className="size-4 mr-2" />
            New Record
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/5 text-destructive text-sm p-4 mb-4">
            {error}
          </div>
        )}

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-0">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {type?.fields?.map((f) => (
                      <TableHead key={f.name}>{f.name}</TableHead>
                    ))}
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!records && (
                    <TableRow>
                      <TableCell
                        colSpan={(type?.fields?.length || 1) + 1}
                        className="text-center text-muted-foreground py-8"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                  {records && records.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={(type?.fields?.length || 1) + 1}
                        className="text-center text-muted-foreground py-12"
                      >
                        No records yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {records?.map((r) => (
                    <TableRow key={r.id}>
                      {type?.fields?.map((f) => (
                        <TableCell key={f.name}>
                          {renderCell(r.data?.[f.name], f)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditRecord(r);
                              setOpen(true);
                            }}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRecord(r.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="mt-0">
            {type && records && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {type.fields
                  .filter((f) =>
                    ["NUMBER", "BOOLEAN", "SELECT"].includes(f.type),
                  )
                  .map((f) => (
                    <div key={f.name} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-4 text-center">
                        {f.name}
                      </h3>
                      <div className="h-[300px] w-full">
                        {f.type === "NUMBER"
                          ? renderBarChart(f, records)
                          : renderPieChart(f, records)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {type &&
              records &&
              type.fields.filter((f) =>
                ["NUMBER", "BOOLEAN", "SELECT"].includes(f.type),
              ).length === 0 && (
                <div className="text-center text-muted-foreground py-12 border rounded-lg">
                  No charted fields available. Add a Number, Boolean, or Select
                  field to see charts.
                </div>
              )}
          </TabsContent>
        </Tabs>
      </main>

      {type && (
        <RecordDialog
          open={open}
          onOpenChange={setOpen}
          type={type}
          editRecord={editRecord}
          onCreated={() => {
            setOpen(false);
            setEditRecord(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function renderCell(value: any, f: FieldDef) {
  if (value === undefined || value === null || value === "")
    return <span className="text-muted-foreground">—</span>;
  if (f.type === "BOOLEAN")
    return (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "true" : "false"}
      </Badge>
    );
  if (f.type === "MULTI_SELECT" && Array.isArray(value))
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v) => (
          <Badge key={v} variant="outline">
            {v}
          </Badge>
        ))}
      </div>
    );
  if (typeof value === "object")
    return <code className="text-xs">{JSON.stringify(value)}</code>;
  return String(value);
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

function renderBarChart(f: FieldDef, records: EntityRecord[]) {
  const data = records.map((r, i) => ({
    name: `Record ${i + 1}`,
    value: Number(r.data[f.name]) || 0,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" hide />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderPieChart(f: FieldDef, records: EntityRecord[]) {
  const counts: Record<string, number> = {};
  records.forEach((r) => {
    const val = String(r.data[f.name] ?? "Unknown");
    counts[val] = (counts[val] || 0) + 1;
  });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label={(entry) => `${entry.name} (${entry.value})`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RecordDialog({
  open,
  onOpenChange,
  type,
  editRecord,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: EntityType;
  editRecord?: EntityRecord | null;
  onCreated: () => void;
}) {
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setData(editRecord ? { ...editRecord.data } : {});
    }
  }, [open, editRecord]);

  const update = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of type.fields) {
      if (
        f.required &&
        (data[f.name] === undefined ||
          data[f.name] === "" ||
          data[f.name] === null)
      ) {
        return toast.error(`${f.name} is required`);
      }
    }
    setSaving(true);
    try {
      if (editRecord) {
        await api(`/api/records/${editRecord.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...editRecord, data }),
        });
        toast.success("Record updated");
      } else {
        await api(`/api/records/entity/${type.id}`, {
          method: "POST",
          body: JSON.stringify({ data }),
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
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val && editRecord) {
          // Reset state when clicking outside or hitting ESC so it doesn't stay as Edit mode
          onCreated(); // The parent handles setting editRecord to null
        }
      }}
    >
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editRecord ? "Edit" : "New"} {type.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {type.fields.map((f) => (
            <FieldInput
              key={f.name}
              field={f}
              value={data[f.name]}
              onChange={(v) => update(f.name, v)}
            />
          ))}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                if (editRecord) onCreated(); // This resets editRecord to null in parent
              }}
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
