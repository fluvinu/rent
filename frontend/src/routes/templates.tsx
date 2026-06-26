import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, FolderKanban, UserCheck, Package, Sparkles, Check } from "lucide-react";

export const Route = createFileRoute("/templates")({
  head: () => ({ meta: [{ title: "Templates — AppBuilder" }] }),
  component: TemplatesPage,
});

interface TemplateField {
  name: string;
  type: string;
  required?: boolean;
  options?: string[];
  relationTargetType?: string;
}

interface TemplateEntity {
  name: string;
  description?: string;
  color: string;
  fields: TemplateField[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tags: string[];
  entities: TemplateEntity[];
}

const TEMPLATES: Template[] = [
  {
    id: "crm",
    name: "CRM",
    description: "Manage contacts, companies, deals, and sales activities. Track your pipeline from prospect to customer.",
    icon: <Users className="size-6" />,
    color: "from-blue-500 to-indigo-600",
    tags: ["Sales", "Contacts", "Pipeline"],
    entities: [
      {
        name: "Companies",
        description: "Organizations and businesses",
        color: "#6366f1",
        fields: [
          { name: "Name", type: "TEXT", required: true },
          { name: "Industry", type: "SELECT", options: ["Technology","Finance","Healthcare","Retail","Manufacturing","Education","Other"] },
          { name: "Website", type: "TEXT" },
          { name: "Size", type: "SELECT", options: ["1–10","11–50","51–200","201–500","500+"] },
          { name: "Country", type: "TEXT" },
          { name: "Notes", type: "TEXT" },
        ],
      },
      {
        name: "Contacts",
        description: "People and leads",
        color: "#8b5cf6",
        fields: [
          { name: "Name", type: "TEXT", required: true },
          { name: "Email", type: "TEXT" },
          { name: "Phone", type: "TEXT" },
          { name: "Role", type: "TEXT" },
          { name: "Status", type: "SELECT", options: ["Lead","Prospect","Customer","Churned","Unqualified"] },
          { name: "Notes", type: "TEXT" },
        ],
      },
      {
        name: "Deals",
        description: "Sales opportunities",
        color: "#ec4899",
        fields: [
          { name: "Title", type: "TEXT", required: true },
          { name: "Value", type: "NUMBER" },
          { name: "Stage", type: "SELECT", options: ["Prospecting","Qualification","Proposal","Negotiation","Won","Lost"] },
          { name: "Close Date", type: "DATE" },
          { name: "Priority", type: "SELECT", options: ["Low","Medium","High"] },
          { name: "Notes", type: "TEXT" },
        ],
      },
      {
        name: "Activities",
        description: "Calls, emails and meetings",
        color: "#f59e0b",
        fields: [
          { name: "Subject", type: "TEXT", required: true },
          { name: "Type", type: "SELECT", options: ["Call","Email","Meeting","Demo","Follow-up","Note"] },
          { name: "Date", type: "DATE" },
          { name: "Duration (min)", type: "NUMBER" },
          { name: "Status", type: "SELECT", options: ["Planned","Completed","Cancelled"] },
          { name: "Notes", type: "TEXT" },
        ],
      },
    ],
  },
  {
    id: "pm",
    name: "Project Manager",
    description: "Plan and track projects, tasks, and milestones. Keep your team aligned and on schedule.",
    icon: <FolderKanban className="size-6" />,
    color: "from-violet-500 to-purple-700",
    tags: ["Projects", "Tasks", "Agile"],
    entities: [
      {
        name: "Projects",
        description: "Top-level initiatives",
        color: "#7c3aed",
        fields: [
          { name: "Name", type: "TEXT", required: true },
          { name: "Description", type: "TEXT" },
          { name: "Status", type: "SELECT", options: ["Planning","Active","On Hold","Completed","Cancelled"] },
          { name: "Priority", type: "SELECT", options: ["Low","Medium","High","Critical"] },
          { name: "Start Date", type: "DATE" },
          { name: "End Date", type: "DATE" },
          { name: "Budget", type: "NUMBER" },
        ],
      },
      {
        name: "Tasks",
        description: "Individual work items",
        color: "#9333ea",
        fields: [
          { name: "Title", type: "TEXT", required: true },
          { name: "Description", type: "TEXT" },
          { name: "Status", type: "SELECT", options: ["Backlog","Todo","In Progress","Review","Done"] },
          { name: "Priority", type: "SELECT", options: ["Low","Medium","High","Critical"] },
          { name: "Assignee", type: "TEXT" },
          { name: "Due Date", type: "DATE" },
          { name: "Story Points", type: "NUMBER" },
          { name: "Completed", type: "BOOLEAN" },
        ],
      },
      {
        name: "Milestones",
        description: "Key project checkpoints",
        color: "#a855f7",
        fields: [
          { name: "Name", type: "TEXT", required: true },
          { name: "Description", type: "TEXT" },
          { name: "Due Date", type: "DATE" },
          { name: "Completed", type: "BOOLEAN" },
        ],
      },
      {
        name: "Team Members",
        description: "People on your team",
        color: "#c084fc",
        fields: [
          { name: "Name", type: "TEXT", required: true },
          { name: "Email", type: "TEXT" },
          { name: "Role", type: "TEXT" },
          { name: "Availability", type: "SELECT", options: ["Full-time","Part-time","Contractor","Unavailable"] },
        ],
      },
    ],
  },
  {
    id: "hr",
    name: "HR System",
    description: "Manage employees, departments, and leave requests. Keep your HR operations organized.",
    icon: <UserCheck className="size-6" />,
    color: "from-emerald-500 to-teal-600",
    tags: ["HR", "Employees", "Payroll"],
    entities: [
      {
        name: "Departments",
        description: "Company departments",
        color: "#10b981",
        fields: [
          { name: "Name", type: "TEXT", required: true },
          { name: "Description", type: "TEXT" },
          { name: "Head", type: "TEXT" },
          { name: "Budget", type: "NUMBER" },
          { name: "Location", type: "TEXT" },
        ],
      },
      {
        name: "Employees",
        description: "People in your organisation",
        color: "#059669",
        fields: [
          { name: "Name", type: "TEXT", required: true },
          { name: "Email", type: "TEXT" },
          { name: "Phone", type: "TEXT" },
          { name: "Job Title", type: "TEXT" },
          { name: "Employment Type", type: "SELECT", options: ["Full-time","Part-time","Contractor","Intern"] },
          { name: "Status", type: "SELECT", options: ["Active","On Leave","Probation","Terminated"] },
          { name: "Start Date", type: "DATE" },
          { name: "Salary", type: "NUMBER" },
        ],
      },
      {
        name: "Leave Requests",
        description: "Time-off requests",
        color: "#047857",
        fields: [
          { name: "Employee Name", type: "TEXT", required: true },
          { name: "Leave Type", type: "SELECT", options: ["Annual","Sick","Parental","Unpaid","Emergency","Bereavement"] },
          { name: "Start Date", type: "DATE", required: true },
          { name: "End Date", type: "DATE", required: true },
          { name: "Status", type: "SELECT", options: ["Pending","Approved","Rejected","Cancelled"] },
          { name: "Reason", type: "TEXT" },
        ],
      },
      {
        name: "Performance Reviews",
        description: "Employee evaluations",
        color: "#065f46",
        fields: [
          { name: "Employee Name", type: "TEXT", required: true },
          { name: "Period", type: "TEXT" },
          { name: "Rating", type: "SELECT", options: ["Exceptional","Exceeds Expectations","Meets Expectations","Needs Improvement","Unsatisfactory"] },
          { name: "Goals Met", type: "BOOLEAN" },
          { name: "Review Date", type: "DATE" },
          { name: "Notes", type: "TEXT" },
        ],
      },
    ],
  },
  {
    id: "inventory",
    name: "Inventory",
    description: "Track products, categories, suppliers, and orders. Keep your inventory under control.",
    icon: <Package className="size-6" />,
    color: "from-orange-500 to-red-600",
    tags: ["Products", "Orders", "Stock"],
    entities: [
      {
        name: "Categories",
        description: "Product categories",
        color: "#f97316",
        fields: [
          { name: "Name", type: "TEXT", required: true },
          { name: "Description", type: "TEXT" },
        ],
      },
      {
        name: "Products",
        description: "Items in your inventory",
        color: "#ea580c",
        fields: [
          { name: "Name", type: "TEXT", required: true },
          { name: "SKU", type: "TEXT" },
          { name: "Description", type: "TEXT" },
          { name: "Price", type: "NUMBER" },
          { name: "Cost", type: "NUMBER" },
          { name: "Quantity", type: "NUMBER" },
          { name: "Min Stock", type: "NUMBER" },
          { name: "Status", type: "SELECT", options: ["Active","Discontinued","Out of Stock","Draft"] },
        ],
      },
      {
        name: "Suppliers",
        description: "Vendors and suppliers",
        color: "#dc2626",
        fields: [
          { name: "Name", type: "TEXT", required: true },
          { name: "Email", type: "TEXT" },
          { name: "Phone", type: "TEXT" },
          { name: "Country", type: "TEXT" },
          { name: "Payment Terms", type: "SELECT", options: ["Net 7","Net 15","Net 30","Net 60","Prepaid"] },
          { name: "Status", type: "SELECT", options: ["Active","Inactive","Blacklisted"] },
        ],
      },
      {
        name: "Orders",
        description: "Customer purchase orders",
        color: "#b91c1c",
        fields: [
          { name: "Order Number", type: "TEXT", required: true },
          { name: "Customer", type: "TEXT" },
          { name: "Status", type: "SELECT", options: ["Pending","Confirmed","Processing","Shipped","Delivered","Cancelled","Refunded"] },
          { name: "Total", type: "NUMBER" },
          { name: "Order Date", type: "DATE" },
          { name: "Delivery Date", type: "DATE" },
          { name: "Notes", type: "TEXT" },
        ],
      },
    ],
  },
];

function TemplatesPage() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<Template | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState<string[]>([]);

  const install = async (template: Template) => {
    setInstalling(true);
    try {
      const createdIds: Record<string, string> = {};
      for (const entity of template.entities) {
        const created = await api<{ id: string }>("/api/entity-types", {
          method: "POST",
          body: JSON.stringify({
            name: entity.name,
            description: entity.description || "",
            fields: entity.fields.map(f => ({
              name: f.name,
              type: f.type,
              required: f.required || false,
              options: f.options || [],
            })),
          }),
        });
        createdIds[entity.name] = created.id;
      }
      setInstalled(prev => [...prev, template.id]);
      toast.success(`${template.name} template installed! ${template.entities.length} entities created.`);
      setPreview(null);
      setTimeout(() => navigate({ to: "/dashboard" }), 1200);
    } catch (e: any) {
      toast.error(e.message || "Failed to install template");
    } finally {
      setInstalling(false);
    }
  };

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="size-4" />
            App Templates
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Start with a template</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Pick a template to instantly create all the entity types you need. Customize them
            freely after installation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATES.map(template => (
            <Card
              key={template.id}
              className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer border-2 hover:border-primary/40"
              onClick={() => setPreview(template)}
            >
              <div className={`h-24 bg-gradient-to-br ${template.color} relative`}>
                <div className="absolute inset-0 flex items-center px-6">
                  <div className="size-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    {template.icon}
                  </div>
                  {installed.includes(template.id) && (
                    <div className="ml-auto size-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      <Check className="size-4" />
                    </div>
                  )}
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium">{template.entities.length} entities</span>
                  <span>·</span>
                  <span>{template.entities.reduce((s, e) => s + e.fields.length, 0)} fields</span>
                  <Button
                    size="sm"
                    className="ml-auto"
                    onClick={e => { e.stopPropagation(); setPreview(template); }}
                  >
                    {installed.includes(template.id) ? "Install Again" : "Use Template"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!preview} onOpenChange={v => !v && setPreview(null)}>
          {preview && (
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <div className={`-mx-6 -mt-6 h-28 bg-gradient-to-br ${preview.color} flex items-center px-6 mb-4 rounded-t-lg`}>
                  <div className="size-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    {preview.icon}
                  </div>
                  <div className="ml-4">
                    <DialogTitle className="text-white text-xl">{preview.name}</DialogTitle>
                    <DialogDescription className="text-white/80 mt-0.5">
                      {preview.entities.length} entities · {preview.entities.reduce((s,e)=>s+e.fields.length,0)} fields
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{preview.description}</p>

                <div className="space-y-3">
                  {preview.entities.map(entity => (
                    <div key={entity.name} className="border rounded-lg overflow-hidden">
                      <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: entity.color + "15", borderBottom: `1px solid ${entity.color}30` }}>
                        <div className="size-2.5 rounded-full" style={{ background: entity.color }} />
                        <span className="font-medium text-sm">{entity.name}</span>
                        {entity.description && (
                          <span className="text-xs text-muted-foreground">— {entity.description}</span>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">{entity.fields.length} fields</span>
                      </div>
                      <div className="px-3 py-2 flex flex-wrap gap-1.5">
                        {entity.fields.map(f => (
                          <span key={f.name} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {f.name}
                            <span className="text-muted-foreground ml-1">({f.type.toLowerCase()})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setPreview(null)}>Cancel</Button>
                <Button onClick={() => install(preview)} disabled={installing}>
                  <Sparkles className="size-4 mr-2" />
                  {installing ? "Installing..." : `Install ${preview.name}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </AppShell>
  );
}
