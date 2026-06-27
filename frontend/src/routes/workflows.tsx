import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { api, type EntityType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Zap, Plus, Trash2, Edit, ChevronRight, Play, Globe, Code,
  FileText, RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/workflows")({
  head: () => ({ meta: [{ title: "Workflows — AppBuilder" }] }),
  component: WorkflowsPage,
});

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Action {
  type: string;
  field?: string;
  value?: string;
  entityTypeId?: string;
  url?: string;
  script?: string;
  message?: string;
}

interface Workflow {
  id: string;
  name: string;
  entityTypeId: string;
  trigger: string;
  conditions?: Condition[];
  actions: Action[];
  enabled?: boolean;
}

const TRIGGERS = [
  { value: "RECORD_CREATED", label: "Record Created", icon: <Plus className="size-4" /> },
  { value: "RECORD_UPDATED", label: "Record Updated", icon: <RefreshCw className="size-4" /> },
  { value: "RECORD_DELETED", label: "Record Deleted", icon: <Trash2 className="size-4" /> },
];

const ACTION_TYPES = [
  { value: "UPDATE_FIELD", label: "Update Field", icon: <Edit className="size-4" /> },
  { value: "CREATE_RECORD", label: "Create Record", icon: <Plus className="size-4" /> },
  { value: "WEBHOOK", label: "Send Webhook", icon: <Globe className="size-4" /> },
  { value: "SCRIPT", label: "Run Script", icon: <Code className="size-4" /> },
  { value: "LOG", label: "Log Message", icon: <FileText className="size-4" /> },
];

const OPERATORS = ["equals","not_equals","contains","greater_than","less_than","is_empty","is_not_empty"];

const TRIGGER_COLORS: Record<string, string> = {
  RECORD_CREATED: "bg-green-100 text-green-700",
  RECORD_UPDATED: "bg-blue-100 text-blue-700",
  RECORD_DELETED: "bg-red-100 text-red-700",
};

function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [types, setTypes] = useState<EntityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editWorkflow, setEditWorkflow] = useState<Workflow | null>(null);

  const load = async () => {
    try {
      const [wf, et] = await Promise.all([
        api<Workflow[]>("/api/workflows").catch(() => []),
        api<EntityType[]>("/api/entity-types").catch(() => []),
      ]);
      setWorkflows(Array.isArray(wf) ? wf : []);
      setTypes(Array.isArray(et) ? et : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteWorkflow = async (id: string) => {
    if (!confirm("Delete this workflow?")) return;
    try {
      await api(`/api/workflows/${id}`, { method: "DELETE" });
      toast.success("Workflow deleted");
      setWorkflows(w => w.filter(x => x.id !== id));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const getTypeName = (id: string) => types.find(t => t.id === id)?.name || id;

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
            <p className="text-muted-foreground mt-1">
              Automate actions when records are created, updated, or deleted.
            </p>
          </div>
          <Button onClick={() => { setEditWorkflow(null); setBuilderOpen(true); }}>
            <Plus className="size-4 mr-2" /> New Workflow
          </Button>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <Card key={i} className="h-24 animate-pulse" />)}
          </div>
        )}

        {!loading && workflows.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 flex flex-col items-center text-center">
              <Zap className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No workflows yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-6 max-w-sm">
                Create your first automation to run actions automatically when records change.
              </p>
              <Button onClick={() => setBuilderOpen(true)}>
                <Plus className="size-4 mr-2" /> Create Workflow
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && workflows.length > 0 && (
          <div className="space-y-3">
            {workflows.map(wf => (
              <Card key={wf.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Zap className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{wf.name}</p>
                        <Badge className={TRIGGER_COLORS[wf.trigger] || "bg-muted text-muted-foreground"}>
                          {TRIGGERS.find(t => t.value === wf.trigger)?.label || wf.trigger}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground flex-wrap">
                        <span>On</span>
                        <span className="font-medium text-foreground">{getTypeName(wf.entityTypeId)}</span>
                        <ChevronRight className="size-3" />
                        <span>{wf.actions.length} action{wf.actions.length !== 1 ? "s" : ""}</span>
                        {wf.conditions && wf.conditions.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{wf.conditions.length} condition{wf.conditions.length !== 1 ? "s" : ""}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {wf.actions.map((a, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {ACTION_TYPES.find(t => t.value === a.type)?.label || a.type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditWorkflow(wf); setBuilderOpen(true); }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWorkflow(wf.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <WorkflowBuilder
          open={builderOpen}
          onOpenChange={setBuilderOpen}
          types={types}
          editWorkflow={editWorkflow}
          onSaved={() => { setBuilderOpen(false); load(); }}
        />
      </div>
    </AppShell>
  );
}

function WorkflowBuilder({
  open, onOpenChange, types, editWorkflow, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  types: EntityType[];
  editWorkflow: Workflow | null;
  onSaved: () => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [entityTypeId, setEntityTypeId] = useState("");
  const [trigger, setTrigger] = useState("RECORD_CREATED");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actions, setActions] = useState<Action[]>([{ type: "LOG", message: "" }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editWorkflow) {
        setName(editWorkflow.name);
        setEntityTypeId(editWorkflow.entityTypeId);
        setTrigger(editWorkflow.trigger);
        setConditions(editWorkflow.conditions || []);
        setActions(editWorkflow.actions.length > 0 ? editWorkflow.actions : [{ type: "LOG", message: "" }]);
      } else {
        setName("");
        setEntityTypeId(types[0]?.id || "");
        setTrigger("RECORD_CREATED");
        setConditions([]);
        setActions([{ type: "LOG", message: "" }]);
      }
      setStep(0);
    }
  }, [open, editWorkflow, types]);

  const selectedType = types.find(t => t.id === entityTypeId);

  const save = async () => {
    if (!name.trim()) return toast.error("Workflow name is required");
    if (!entityTypeId) return toast.error("Select an entity type");
    if (actions.length === 0) return toast.error("Add at least one action");

    setSaving(true);
    try {
      const payload = { name, entityTypeId, trigger, conditions, actions };
      if (editWorkflow) {
        await api(`/api/workflows/${editWorkflow.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Workflow updated");
      } else {
        await api("/api/workflows", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Workflow created");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const steps = ["Trigger", "Conditions", "Actions", "Review"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editWorkflow ? "Edit" : "Create"} Workflow</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          {steps.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Notify on new contact" />
            </div>
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select value={entityTypeId} onValueChange={setEntityTypeId}>
                <SelectTrigger><SelectValue placeholder="Select entity..." /></SelectTrigger>
                <SelectContent>
                  {types.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trigger Event</Label>
              <div className="grid grid-cols-3 gap-2">
                {TRIGGERS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTrigger(t.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      trigger === t.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Conditions (Optional)</p>
                <p className="text-sm text-muted-foreground">Only run this workflow if these conditions are met.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConditions(c => [...c, { field: selectedType?.fields[0]?.name || "", operator: "equals", value: "" }])}
              >
                <Plus className="size-4 mr-1" /> Add
              </Button>
            </div>
            {conditions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg border-dashed">
                No conditions — workflow runs for every trigger event.
              </div>
            )}
            {conditions.map((cond, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <Select value={cond.field} onValueChange={v => setConditions(c => c.map((x,j) => j===i?{...x,field:v}:x))}>
                    <SelectTrigger><SelectValue placeholder="Field" /></SelectTrigger>
                    <SelectContent>
                      {selectedType?.fields.filter(f => !f.isHidden).map(f => <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={cond.operator} onValueChange={v => setConditions(c => c.map((x,j) => j===i?{...x,operator:v}:x))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map(o => <SelectItem key={o} value={o}>{o.replace(/_/g," ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    value={cond.value}
                    onChange={e => setConditions(c => c.map((x,j) => j===i?{...x,value:e.target.value}:x))}
                    placeholder="Value"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setConditions(c => c.filter((_,j)=>j!==i))}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Actions</p>
                <p className="text-sm text-muted-foreground">What should happen when the trigger fires?</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActions(a => [...a, { type: "LOG", message: "" }])}
              >
                <Plus className="size-4 mr-1" /> Add Action
              </Button>
            </div>
            {actions.map((action, i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Action {i + 1}</span>
                    {actions.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => setActions(a => a.filter((_,j)=>j!==i))}>
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {ACTION_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setActions(a => a.map((x,j) => j===i?{...x,type:t.value}:x))}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                          action.type === t.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-muted hover:border-muted-foreground/30"
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {action.type === "UPDATE_FIELD" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Field</Label>
                        <Select value={action.field||""} onValueChange={v => setActions(a=>a.map((x,j)=>j===i?{...x,field:v}:x))}>
                          <SelectTrigger className="h-8"><SelectValue placeholder="Field" /></SelectTrigger>
                          <SelectContent>
                            {selectedType?.fields.filter(f => !f.isHidden).map(f=><SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Value</Label>
                        <Input className="h-8" value={action.value||""} onChange={e=>setActions(a=>a.map((x,j)=>j===i?{...x,value:e.target.value}:x))} placeholder="New value" />
                      </div>
                    </div>
                  )}
                  {action.type === "WEBHOOK" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Webhook URL</Label>
                      <Input value={action.url||""} onChange={e=>setActions(a=>a.map((x,j)=>j===i?{...x,url:e.target.value}:x))} placeholder="https://..." />
                    </div>
                  )}
                  {action.type === "SCRIPT" && (
                    <div className="space-y-1">
                      <Label className="text-xs">JavaScript Code</Label>
                      <Textarea
                        value={action.script||""}
                        onChange={e=>setActions(a=>a.map((x,j)=>j===i?{...x,script:e.target.value}:x))}
                        rows={5}
                        placeholder={'// Access record via `record`\nconsole.log(record.data);'}
                        className="font-mono text-xs"
                      />
                    </div>
                  )}
                  {action.type === "LOG" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Log Message</Label>
                      <Input value={action.message||""} onChange={e=>setActions(a=>a.map((x,j)=>j===i?{...x,message:e.target.value}:x))} placeholder="Record was created: {{id}}" />
                    </div>
                  )}
                  {action.type === "CREATE_RECORD" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Target Entity Type</Label>
                      <Select value={action.entityTypeId||""} onValueChange={v=>setActions(a=>a.map((x,j)=>j===i?{...x,entityTypeId:v}:x))}>
                        <SelectTrigger><SelectValue placeholder="Target entity..." /></SelectTrigger>
                        <SelectContent>
                          {types.map(t=><SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Review your workflow before saving.</p>
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-primary" />
                  <span className="font-semibold">{name || "(No name)"}</span>
                </div>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0">Entity:</span>
                    <span className="font-medium text-foreground">{types.find(t=>t.id===entityTypeId)?.name || "—"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0">Trigger:</span>
                    <span className="font-medium text-foreground">{TRIGGERS.find(t=>t.value===trigger)?.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0">Conditions:</span>
                    <span className="font-medium text-foreground">{conditions.length > 0 ? `${conditions.length} condition${conditions.length>1?"s":""}` : "None"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0">Actions:</span>
                    <div className="flex flex-wrap gap-1">
                      {actions.map((a,i) => <Badge key={i} variant="outline" className="text-xs">{ACTION_TYPES.find(t=>t.value===a.type)?.label}</Badge>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
          )}
          {step < steps.length - 1 && (
            <Button onClick={() => setStep(s => s + 1)}>Next <ChevronRight className="size-4 ml-1" /></Button>
          )}
          {step === steps.length - 1 && (
            <Button onClick={save} disabled={saving}>
              <Play className="size-4 mr-2" />
              {saving ? "Saving..." : editWorkflow ? "Update Workflow" : "Create Workflow"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
