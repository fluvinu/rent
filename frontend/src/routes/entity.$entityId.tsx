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
import { useAuth } from "@/lib/auth";
import { api, type EntityRecord, type EntityType, type FieldDef } from "@/lib/api";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { FieldInput } from "@/components/FieldInput";

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

  useEffect(() => {
    if (ready && !token) navigate({ to: "/" });
  }, [ready, token, navigate]);

  const load = () => {
    api<EntityType>(`/api/entity-types/${entityId}`).then(setType).catch((e) => setError(e.message));
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
    if (!confirm("Delete this entire dataset? All records and schema will be lost.")) return;
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
              <Link to="/"><ArrowLeft className="size-4 mr-2" />Back</Link>
            </Button>
            <h1 className="font-semibold">{type?.name || "Loading..."}</h1>
          </div>
          {type && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/entity/edit/${entityId}`}><Edit className="size-4 mr-2" />Edit Schema</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteDataset}>
                <Trash2 className="size-4 mr-2" />Delete Dataset
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Records</h2>
            {type?.description && <p className="text-muted-foreground text-sm mt-1">{type.description}</p>}
          </div>
          <Button onClick={() => setOpen(true)} disabled={!type}>
            <Plus className="size-4 mr-2" />New Record
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/5 text-destructive text-sm p-4 mb-4">{error}</div>
        )}

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
                <TableRow><TableCell colSpan={(type?.fields?.length || 1) + 1} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              )}
              {records && records.length === 0 && (
                <TableRow><TableCell colSpan={(type?.fields?.length || 1) + 1} className="text-center text-muted-foreground py-12">No records yet.</TableCell></TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id}>
                  {type?.fields?.map((f) => (
                    <TableCell key={f.name}>{renderCell(r.data?.[f.name], f)}</TableCell>
                  ))}
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteRecord(r.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {type && (
        <RecordDialog
          open={open}
          onOpenChange={setOpen}
          type={type}
          onCreated={() => {
            setOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function renderCell(value: any, f: FieldDef) {
  if (value === undefined || value === null || value === "") return <span className="text-muted-foreground">—</span>;
  if (f.type === "BOOLEAN") return <Badge variant={value ? "default" : "secondary"}>{value ? "true" : "false"}</Badge>;
  if (f.type === "MULTI_SELECT" && Array.isArray(value))
    return <div className="flex flex-wrap gap-1">{value.map((v) => <Badge key={v} variant="outline">{v}</Badge>)}</div>;
  if (typeof value === "object") return <code className="text-xs">{JSON.stringify(value)}</code>;
  return String(value);
}

function RecordDialog({
  open,
  onOpenChange,
  type,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: EntityType;
  onCreated: () => void;
}) {
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setData({});
  }, [open]);

  const update = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of type.fields) {
      if (f.required && (data[f.name] === undefined || data[f.name] === "" || data[f.name] === null)) {
        return toast.error(`${f.name} is required`);
      }
    }
    setSaving(true);
    try {
      await api(`/api/records/entity/${type.id}`, {
        method: "POST",
        body: JSON.stringify({ data }),
      });
      toast.success("Record created");
      onCreated();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New {type.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {type.fields.map((f) => (
            <FieldInput key={f.name} field={f} value={data[f.name]} onChange={(v) => update(f.name, v)} />
          ))}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}