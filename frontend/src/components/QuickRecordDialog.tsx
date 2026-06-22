import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, type EntityType, type FieldType } from "@/lib/api";
import { toast } from "sonner";
import { FieldInput } from "./FieldInput";

export function QuickRecordDialog({
  open,
  onOpenChange,
  types,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  types: EntityType[];
  onCreated: () => void;
}) {
  const [openCombobox, setOpenCombobox] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState<string | null>(null);

  const [existingData, setExistingData] = useState<Record<string, any>>({});
  const [kvPairs, setKvPairs] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedTypeId(null);
      setNewTypeName(null);
      setSearch("");
      setExistingData({});
      setKvPairs([{ key: "", value: "" }]);
    }
  }, [open]);

  const selectedType = types.find((t) => t.id === selectedTypeId);

  const inferType = (value: string): { type: FieldType; parsedValue: any } => {
    if (!value) return { type: "TEXT", parsedValue: "" };
    const lower = value.trim().toLowerCase();
    if (lower === "true") return { type: "BOOLEAN", parsedValue: true };
    if (lower === "false") return { type: "BOOLEAN", parsedValue: false };
    if (!isNaN(Number(value)) && value.trim() !== "")
      return { type: "NUMBER", parsedValue: Number(value) };
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim()))
      return { type: "DATE", parsedValue: value.trim() };
    return { type: "TEXT", parsedValue: value };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId && !newTypeName)
      return toast.error("Please select or create a dataset");

    setSaving(true);
    try {
      if (selectedType) {
        // Validation for existing
        for (const f of selectedType.fields) {
          if (
            f.required &&
            (existingData[f.name] === undefined ||
              existingData[f.name] === "" ||
              existingData[f.name] === null)
          ) {
            toast.error(`${f.name} is required`);
            setSaving(false);
            return;
          }
        }
        await api(`/api/records/entity/${selectedType.id}`, {
          method: "POST",
          body: JSON.stringify({ data: existingData }),
        });
      } else if (newTypeName) {
        // Create new dataset
        const validKv = kvPairs.filter((kv) => kv.key.trim() !== "");
        if (validKv.length === 0) {
          toast.error("Please add at least one field");
          setSaving(false);
          return;
        }

        const fields = validKv.map((kv) => {
          const { type } = inferType(kv.value);
          return { name: kv.key.trim(), type, required: false };
        });

        const newType: EntityType = await api("/api/entity-types", {
          method: "POST",
          body: JSON.stringify({ name: newTypeName, description: "", fields }),
        });

        const data: Record<string, any> = {};
        validKv.forEach((kv) => {
          const { parsedValue } = inferType(kv.value);
          data[kv.key.trim()] = parsedValue;
        });

        await api(`/api/records/entity/${newType.id}`, {
          method: "POST",
          body: JSON.stringify({ data }),
        });
      }

      toast.success("Record created successfully");
      onCreated();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const exactMatch = types.find(
    (t) => t.name.toLowerCase() === search.trim().toLowerCase(),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Record Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <Label>Dataset</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  {selectedTypeId
                    ? types.find((t) => t.id === selectedTypeId)?.name
                    : newTypeName
                      ? `Create "${newTypeName}"`
                      : "Select dataset..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[460px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search or type new dataset..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {search.trim() ? (
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-2 py-1.5"
                          onClick={() => {
                            setNewTypeName(search.trim());
                            setSelectedTypeId(null);
                            setOpenCombobox(false);
                          }}
                        >
                          Create "{search.trim()}"
                        </Button>
                      ) : (
                        "No datasets found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {types.map((t) => (
                        <CommandItem
                          key={t.id}
                          value={t.name}
                          onSelect={() => {
                            setSelectedTypeId(t.id);
                            setNewTypeName(null);
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTypeId === t.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {t.name}
                        </CommandItem>
                      ))}
                      {search.trim() && !exactMatch && (
                        <CommandItem
                          value={search}
                          onSelect={() => {
                            setNewTypeName(search.trim());
                            setSelectedTypeId(null);
                            setOpenCombobox(false);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create "{search.trim()}"
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedType && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-sm">Record Data</h3>
              {selectedType.fields.map((f) => (
                <FieldInput
                  key={f.name}
                  field={f}
                  value={existingData[f.name]}
                  onChange={(v) =>
                    setExistingData((d) => ({ ...d, [f.name]: v }))
                  }
                />
              ))}
            </div>
          )}

          {newTypeName && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Dynamic Record Data</h3>
              </div>
              {kvPairs.map((kv, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Field Name"
                      value={kv.key}
                      onChange={(e) =>
                        setKvPairs((p) =>
                          p.map((x, idx) =>
                            idx === i ? { ...x, key: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Value (e.g. true, 123, text)"
                      value={kv.value}
                      onChange={(e) =>
                        setKvPairs((p) =>
                          p.map((x, idx) =>
                            idx === i ? { ...x, value: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setKvPairs((p) => p.filter((_, idx) => idx !== i))
                    }
                    disabled={kvPairs.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setKvPairs((p) => [...p, { key: "", value: "" }])
                }
              >
                <Plus className="size-4 mr-2" /> Add Field
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || (!selectedTypeId && !newTypeName)}
            >
              {saving ? "Saving..." : "Save Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
