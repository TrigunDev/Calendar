import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note, DateRange } from "@/lib/calendar-utils";

interface NotesSectionProps {
  notes: Note[];
  selectedRange: DateRange;
  onAddNote: (text: string, range?: DateRange) => void;
  onDeleteNote: (id: string) => void;
}

export default function NotesSection({
  notes,
  selectedRange,
  onAddNote,
  onDeleteNote,
}: NotesSectionProps) {
  const [newNote, setNewNote] = useState("");

  const handleAdd = () => {
    if (!newNote.trim()) return;
    const range =
      selectedRange.start && selectedRange.end ? { ...selectedRange } : undefined;
    onAddNote(newNote.trim(), range);
    setNewNote("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const formatRange = (range?: DateRange) => {
    if (!range?.start || !range?.end) return null;
    return `${format(range.start, "MMM d")} – ${format(range.end, "MMM d")}`;
  };

  return (
    <div className="p-4 md:p-5 border-t border-border">
      <h3 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase mb-3">
        Notes
      </h3>

      
      {selectedRange.start && selectedRange.end && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-md bg-calendar-range text-calendar-range-foreground text-xs font-medium">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>
            {format(selectedRange.start, "MMM d")} – {format(selectedRange.end, "MMM d, yyyy")}
          </span>
        </div>
      )}

      
      <div className="flex gap-2 mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedRange.start && selectedRange.end
              ? "Add a note for this date range..."
              : "Add a general note..."
          }
          className="flex-1 min-h-[36px] max-h-24 px-3 py-2 text-sm bg-muted rounded-md border-none resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          rows={1}
        />
        <button
          onClick={handleAdd}
          disabled={!newNote.trim()}
          className="shrink-0 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
          aria-label="Add note"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      
      <div className="space-y-2 max-h-36 sm:max-h-48 overflow-y-auto">
        {notes.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-xs text-muted-foreground">
              Select a date range and add notes
            </p>
            <div className="mt-3 space-y-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-px bg-border mx-4"
                />
              ))}
            </div>
          </div>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="group flex items-start gap-2 p-2.5 rounded-md hover:bg-muted/50 transition-colors animate-fade-slide-in"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-relaxed">{note.text}</p>
              {note.dateRange && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {formatRange(note.dateRange)}
                </p>
              )}
            </div>
            <button
              onClick={() => onDeleteNote(note.id)}
              className="shrink-0 p-1 rounded opacity-100 sm:opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
              aria-label="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

