import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { api, type FieldDef, type FieldType, type EntityType } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const FIELD_TYPES: FieldType[] = [
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "DATE",
  "SELECT",
  "MULTI_SELECT",
  "RELATION",
  "FILE",
  "JSON",
];

interface DraftField extends FieldDef {
  optionsStr?: string;
  relationTargetType?: string;
}

export const Route = createFileRoute("/entity/edit/$entityId")({
  head: () => ({ meta: [{ title: "Edit Entity Type — Rent" }] }),
  component: EditEntityType,
});

function EditEntityType() {
  const { entityId } = Route.useParams();
  const { token, ready } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<DraftField[]>([]);
  const [subEntityTypes, setSubEntityTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);

  useEffect(() => {
    if (ready && !token) navigate({ to: "/" });
  }, [ready, token, navigate]);

  useEffect(() => {
    if (token) {
      api<EntityType[]>("/api/entity-types")
        .then((data) => setEntityTypes(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    api<EntityType>(`/api/entity-types/${entityId}`)
      .then((type) => {
        setName(type.name);
        setDescription(type.description || "");
        setFields(
          type.fields.map((f) => ({
            ...f,
            optionsStr: f.options ? f.options.join(", ") : undefined,
            relationTargetType: f.relationTargetType,
          })),
        );
        setSubEntityTypes(type.subEntityTypes || []);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load entity type");
        navigate({ to: "/" });
      })
      .finally(() => setLoading(false));
  }, [entityId, navigate]);

  const update = (i: number, patch: Partial<DraftField>) =>
    setFields((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const addField = () =>
    setFields((f) => [...f, { name: "", type: "TEXT", required: false }]);
  const removeField = (i: number) =>
    setFields((f) => f.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    if (fields.some((f) => !f.name.trim()))
      return toast.error("All fields need a name");

    const payload = {
      name: name.trim(),
      description: description.trim(),
      subEntityTypes,
      fields: fields.map((f) => {
        const def: FieldDef = {
          key: f.key, // Preserve the key!
          name: f.name.trim(),
          type: f.type,
          required: !!f.required,
        };
        if (
          (f.type === "SELECT" || f.type === "MULTI_SELECT") &&
          f.optionsStr
        ) {
          def.options = f.optionsStr
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        if (f.type === "RELATION" && f.relationTargetType) {
          def.relationTargetType = f.relationTargetType;
        }
        return def;
      }),
    };

    setSaving(true);
    try {
      await api(`/api/entity-types/${entityId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Entity type updated");
      navigate({ to: `/entity/${entityId}` });
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Edit Schema</h1>
          <p className="text-muted-foreground text-sm mt-1">Modify fields for {name}.</p>
        </div>
        <form onSubmit={submit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Customer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Sub Entities (Optional)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                  {entityTypes.map((t) => {
                    const checked = subEntityTypes.includes(t.id);
                    return (
                      <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            if (c) setSubEntityTypes([...subEntityTypes, t.id]);
                            else setSubEntityTypes(subEntityTypes.filter((x) => x !== t.id));
                          }}
                        />
                        {t.name}
                      </label>
                    );
                  })}
                  {entityTypes.length === 0 && (
                    <span className="text-sm text-muted-foreground">No other entity types available.</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select which entities can be added as child records to this one.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fields</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
              >
                <Plus className="size-4 mr-2" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((f, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
                    <div className="space-y-1">
                      <Label>Field name</Label>
                      <Input
                        value={f.name}
                        onChange={(e) => update(i, { name: e.target.value })}
                        placeholder="e.g. email"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <Select
                        value={f.type}
                        onValueChange={(v) =>
                          update(i, { type: v as FieldType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeField(i)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {(f.type === "SELECT" || f.type === "MULTI_SELECT") && (
                    <div className="space-y-1">
                      <Label>Options (comma-separated)</Label>
                      <Input
                        value={f.optionsStr || ""}
                        onChange={(e) =>
                          update(i, { optionsStr: e.target.value })
                        }
                        placeholder="Low, Medium, High"
                      />
                    </div>
                  )}
                  {f.type === "RELATION" && (
                    <div className="space-y-1">
                      <Label>Target Dataset</Label>
                      <Select
                        value={f.relationTargetType || ""}
                        onValueChange={(v) =>
                          update(i, { relationTargetType: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target..." />
                        </SelectTrigger>
                        <SelectContent>
                          {entityTypes.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`req-${i}`}
                      checked={!!f.required}
                      onCheckedChange={(v) => update(i, { required: !!v })}
                    />
                    <Label htmlFor={`req-${i}`} className="font-normal">
                      Required
                    </Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: `/entity/${entityId}` })}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
