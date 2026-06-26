import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type EntityRecord, type EntityType } from "@/lib/api";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  type: EntityType;
  records: EntityRecord[];
  onEdit: (record: EntityRecord) => void;
  onNew: () => void;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function CalendarView({ type, records, onEdit, onNew }: CalendarViewProps) {
  const dateFields = type.fields.filter((f) => f.type === "DATE");
  const [dateField, setDateField] = useState(dateFields[0]?.name || "");

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  if (dateFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground border rounded-lg">
        <p className="font-medium">Calendar requires a Date field</p>
        <p className="text-sm mt-1">Add a DATE field to your schema to view records on the calendar.</p>
      </div>
    );
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const recordsByDay: Record<number, EntityRecord[]> = {};
  records.forEach(r => {
    const val = r.data[dateField];
    if (!val) return;
    const d = new Date(val);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!recordsByDay[day]) recordsByDay[day] = [];
      recordsByDay[day].push(r);
    }
  });

  const titleField = getPrimaryTextField(type);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground font-medium">Date field:</span>
        <Select value={dateField} onValueChange={setDateField}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateFields.map(f => (
              <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={onNew} className="ml-auto">
          <Plus className="size-4 mr-1" /> New Record
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="font-semibold">{MONTHS[month]} {year}</span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7">
          {DOW.map(d => (
            <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground border-b bg-muted/10">
              {d}
            </div>
          ))}
          {cells.map((day, idx) => (
            <div
              key={idx}
              className={cn(
                "min-h-[90px] border-b border-r p-1 last:border-r-0",
                !day && "bg-muted/10",
                day && "hover:bg-muted/20 transition-colors",
              )}
            >
              {day && (
                <>
                  <div className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                    isToday(day)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                  )}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {(recordsByDay[day] || []).map(r => (
                      <button
                        key={r.id}
                        onClick={() => onEdit(r)}
                        className="w-full text-left text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors truncate"
                      >
                        {titleField ? String(r.data[titleField] ?? "Record") : "Record"}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getPrimaryTextField(type: EntityType): string | null {
  const priority = ["name","title","label","subject","summary"];
  for (const p of priority) {
    const f = type.fields.find(f => f.name.toLowerCase() === p && f.type === "TEXT");
    if (f) return f.name;
  }
  return type.fields.find(f => f.type === "TEXT")?.name || null;
}
