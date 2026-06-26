import * as React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, type EntityRecord, type FieldDef } from "@/lib/api";

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
}) {
  const label = (
    <Label>
      {field.name}
      {field.required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );

  switch (field.type) {
    case "BOOLEAN":
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={!!value}
            onCheckedChange={(v) => onChange(!!v)}
            id={`f-${field.name}`}
          />
          <Label htmlFor={`f-${field.name}`} className="font-normal">
            {field.name}
          </Label>
        </div>
      );
    case "DATE":
      return (
        <div className="space-y-2">
          {label}
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "NUMBER":
      return (
        <div className="space-y-2">
          {label}
          <Input
            type="number"
            value={value ?? ""}
            onChange={(e) =>
              onChange(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
      );
    case "SELECT":
      return (
        <div className="space-y-2">
          {label}
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "MULTI_SELECT":
      return (
        <div className="space-y-2">
          {label}
          <div className="flex flex-wrap gap-2 rounded-md border p-3">
            {(field.options || []).map((o) => {
              const arr: string[] = Array.isArray(value) ? value : [];
              const checked = arr.includes(o);
              return (
                <label
                  key={o}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) =>
                      onChange(v ? [...arr, o] : arr.filter((x) => x !== o))
                    }
                  />
                  {o}
                </label>
              );
            })}
          </div>
        </div>
      );
    case "JSON":
      return (
        <div className="space-y-2">
          {label}
          <Textarea
            value={
              typeof value === "string"
                ? value
                : value
                  ? JSON.stringify(value, null, 2)
                  : ""
            }
            onChange={(e) => {
              const v = e.target.value;
              try {
                onChange(JSON.parse(v));
              } catch {
                onChange(v);
              }
            }}
            rows={4}
            placeholder='{ "key": "value" }'
          />
        </div>
      );
    case "RELATION":
      return (
        <RelationFieldInput
          field={field}
          value={value}
          onChange={onChange}
          label={label}
        />
      );
    case "SUBENTITY":
      // SUBENTITY fields are not filled out here, they are populated by linking child records to this record's ID
      return null;
    default:
      return (
        <div className="space-y-2">
          {label}
          <Input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}

function RelationFieldInput({
  field,
  value,
  onChange,
  label,
}: {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
  label: React.ReactNode;
}) {
  const [records, setRecords] = useState<EntityRecord[]>([]);

  useEffect(() => {
    if (field.relationTargetType) {
      api<EntityRecord[]>(`/api/records/entity/${field.relationTargetType}`)
        .then((data) => setRecords(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [field.relationTargetType]);

  const displayRecord = (r: EntityRecord) => {
    // Try to find a sensible display field (like 'name' or 'title' or the first text field)
    const keys = Object.keys(r.data);
    const nameKey =
      keys.find(
        (k) => k.toLowerCase() === "name" || k.toLowerCase() === "title",
      ) || keys[0];
    return nameKey ? String(r.data[nameKey]) : r.id;
  };

  return (
    <div className="space-y-2">
      {label}
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select related record..." />
        </SelectTrigger>
        <SelectContent>
          {records.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {displayRecord(r)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
