import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type EntityRecord, type EntityType, type FieldDef } from "@/lib/api";
import { Edit, Plus, Trash2 } from "lucide-react";

const COLUMN_COLORS = [
  "bg-blue-50 border-blue-200",
  "bg-purple-50 border-purple-200",
  "bg-yellow-50 border-yellow-200",
  "bg-green-50 border-green-200",
  "bg-red-50 border-red-200",
  "bg-orange-50 border-orange-200",
  "bg-pink-50 border-pink-200",
];

const BADGE_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-yellow-100 text-yellow-700",
  "bg-green-100 text-green-700",
  "bg-red-100 text-red-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
];

interface KanbanViewProps {
  type: EntityType;
  records: EntityRecord[];
  onEdit: (record: EntityRecord) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function KanbanView({
  type,
  records,
  onEdit,
  onDelete,
  onNew,
}: KanbanViewProps) {
  const selectFields = type.fields.filter(
    (f) => f.type === "SELECT" || f.type === "BOOLEAN",
  );

  const [groupBy, setGroupBy] = useState<string>(
    selectFields[0]?.name || "",
  );

  if (selectFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground border rounded-lg">
        <p className="font-medium">Kanban requires a Select field</p>
        <p className="text-sm mt-1">
          Add a SELECT or BOOLEAN field to your schema to group records into
          columns.
        </p>
      </div>
    );
  }

  const field = type.fields.find((f) => f.name === groupBy);
  const columns = getColumns(field);

  const grouped: Record<string, EntityRecord[]> = {};
  columns.forEach((c) => (grouped[c] = []));
  grouped["— No value —"] = [];

  records.forEach((r) => {
    const val = r.data?.[groupBy];
    const key = val !== undefined && val !== null && val !== "" ? String(val) : "— No value —";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const titleField = getPrimaryTextField(type);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground font-medium">
          Group by:
        </span>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectFields.map((f) => (
              <SelectItem key={f.name} value={f.name}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={onNew} className="ml-auto">
          <Plus className="size-4 mr-1" /> New Record
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(grouped).map(([col, colRecords], colIdx) => {
          if (colRecords.length === 0 && col === "— No value —") return null;
          const colorClass =
            col === "— No value —"
              ? "bg-muted/40 border-muted"
              : COLUMN_COLORS[colIdx % COLUMN_COLORS.length];
          const badgeClass =
            col === "— No value —"
              ? "bg-muted text-muted-foreground"
              : BADGE_COLORS[colIdx % BADGE_COLORS.length];

          return (
            <div
              key={col}
              className={`flex-shrink-0 w-72 rounded-lg border-2 ${colorClass} flex flex-col`}
            >
              <div className="px-3 py-2.5 flex items-center justify-between border-b border-inherit">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}
                >
                  {col}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {colRecords.length}
                </span>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[65vh]">
                {colRecords.map((record) => (
                  <KanbanCard
                    key={record.id}
                    record={record}
                    type={type}
                    titleField={titleField}
                    groupByField={groupBy}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({
  record,
  type,
  titleField,
  groupByField,
  onEdit,
  onDelete,
}: {
  record: EntityRecord;
  type: EntityType;
  titleField: string | null;
  groupByField: string;
  onEdit: (r: EntityRecord) => void;
  onDelete: (id: string) => void;
}) {
  const title = titleField
    ? String(record.data[titleField] ?? "Untitled")
    : record.id.slice(-6);

  const otherFields = type.fields
    .filter(
      (f) =>
        f.name !== titleField &&
        f.name !== groupByField &&
        f.type !== "JSON" &&
        f.type !== "RELATION",
    )
    .slice(0, 3);

  return (
    <div className="bg-white rounded-md border p-3 shadow-sm group hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm truncate">{title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(record)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="size-3.5" />
          </button>
          <button
            onClick={() => onDelete(record.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {otherFields.length > 0 && (
        <div className="mt-2 space-y-1">
          {otherFields.map((f) => {
            const val = record.data[f.name];
            if (val === undefined || val === null || val === "") return null;
            return (
              <div key={f.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium shrink-0">{f.name}:</span>
                {f.type === "BOOLEAN" ? (
                  <Badge variant={val ? "default" : "secondary"} className="text-xs py-0 h-4">
                    {val ? "Yes" : "No"}
                  </Badge>
                ) : (
                  <span className="truncate">{String(val)}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getColumns(field: FieldDef | undefined): string[] {
  if (!field) return [];
  if (field.type === "BOOLEAN") return ["true", "false"];
  return field.options || [];
}

function getPrimaryTextField(type: EntityType): string | null {
  const priority = ["name", "title", "label", "subject", "summary"];
  for (const p of priority) {
    if (type.fields.find((f) => f.name.toLowerCase() === p && f.type === "TEXT")) {
      return type.fields.find((f) => f.name.toLowerCase() === p)!.name;
    }
  }
  const first = type.fields.find((f) => f.type === "TEXT");
  return first?.name || null;
}
