import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type EntityRecord, type EntityType } from "@/lib/api";
import { Edit, Plus, Trash2 } from "lucide-react";

interface GalleryViewProps {
  type: EntityType;
  records: EntityRecord[];
  onEdit: (record: EntityRecord) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const ACCENT_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-yellow-500 to-amber-600",
  "from-cyan-500 to-blue-600",
];

function hashStr(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function GalleryView({ type, records, onEdit, onDelete, onNew }: GalleryViewProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg">
        <p className="font-medium">No records yet</p>
        <p className="text-sm mt-1 mb-4">Create your first record to see it here.</p>
        <Button onClick={onNew}>
          <Plus className="size-4 mr-2" /> New Record
        </Button>
      </div>
    );
  }

  const titleField = getPrimaryTextField(type);
  const previewFields = type.fields
    .filter(f => !f.isHidden && f.name !== titleField && f.type !== "JSON" && f.type !== "FILE")
    .slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{records.length} records</p>
        <Button size="sm" onClick={onNew}>
          <Plus className="size-4 mr-1" /> New Record
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {records.map((record) => {
          const title = titleField
            ? String(record.data[titleField] ?? "Untitled")
            : record.id.slice(-8);
          const colorClass =
            ACCENT_COLORS[hashStr(record.id) % ACCENT_COLORS.length];

          return (
            <div
              key={record.id}
              className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all"
            >
              <div className={`h-16 bg-gradient-to-br ${colorClass} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold opacity-60">
                    {title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(record)}
                    className="size-6 flex items-center justify-center rounded bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm"
                  >
                    <Edit className="size-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(record.id)}
                    className="size-6 flex items-center justify-center rounded bg-white/20 hover:bg-red-500/60 text-white backdrop-blur-sm"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3">
                <p className="font-semibold text-sm truncate mb-2">{title}</p>
                <div className="space-y-1.5">
                  {previewFields.map((f) => {
                    const val = record.data[f.key || f.name];
                    if (val === undefined || val === null || val === "") return null;
                    return (
                      <div key={f.name} className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground shrink-0">{f.name}</span>
                        <span className="text-muted-foreground">·</span>
                        {f.type === "BOOLEAN" ? (
                          <Badge variant={val ? "default" : "secondary"} className="text-xs h-4 py-0">
                            {val ? "Yes" : "No"}
                          </Badge>
                        ) : f.type === "SELECT" ? (
                          <Badge variant="outline" className="text-xs h-4 py-0 font-normal">
                            {String(val)}
                          </Badge>
                        ) : (
                          <span className="font-medium truncate">{String(val)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getPrimaryTextField(type: EntityType): string | null {
  const priority = ["name","title","label","subject","summary"];
  for (const p of priority) {
    const f = type.fields.find(f => f.name.toLowerCase() === p && f.type === "TEXT");
    if (f) return f.key || f.name;
  }
  const fallback = type.fields.find(f => f.type === "TEXT");
  return fallback ? (fallback.key || fallback.name) : null;
}
