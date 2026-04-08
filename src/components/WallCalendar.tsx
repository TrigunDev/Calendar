import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { addMonths, subMonths, addDays, subDays, isBefore, isSameDay, isSameMonth } from "date-fns";
import CalendarHero from "./CalendarHero";
import CalendarGrid from "./CalendarGrid";
import NotesSection from "./NotesSection";
import YearOverview from "./YearOverview";
import ViewTransition from "./ViewTransition";
import CountdownBadge from "./CountdownBadge";
import TodayButton from "./TodayButton";
import {
  getCalendarDays,
  loadNotes,
  saveNotes,
  applySeasonTheme,
  getSeason,
  type DateRange,
  type Note,
  type Season,
} from "@/lib/calendar-utils";

export default function WallCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [animating, setAnimating] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [season, setSeason] = useState<Season>(getSeason(new Date().getMonth()));
  const [showYearOverview, setShowYearOverview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentMonth.getMonth() &&
    today.getFullYear() === currentMonth.getFullYear();
  useEffect(() => {
    const newSeason = getSeason(currentMonth.getMonth());
    setSeason(newSeason);
    applySeasonTheme(currentMonth.getMonth());
  }, [currentMonth]);
  useEffect(() => {
    applySeasonTheme(new Date().getMonth());
  }, []);

  const handleMonthChange = useCallback((direction: "prev" | "next") => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentMonth((m) =>
        direction === "next" ? addMonths(m, 1) : subMonths(m, 1)
      );
      setAnimating(false);
    }, 150);
  }, []);

  const handleGoToday = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentMonth(new Date());
      setAnimating(false);
    }, 150);
  }, []);

  const handleDayClick = useCallback(
    (date: Date) => {
      if (isDragging) return;
      if (!selectingEnd) {
        setSelectedRange({ start: date, end: null });
        setSelectingEnd(true);
      } else {
        const start = selectedRange.start!;
        const newRange: DateRange = isBefore(date, start)
          ? { start: date, end: start }
          : { start, end: date };
        setSelectedRange(newRange);
        setSelectingEnd(false);
      }
      setFocusedDate(date);
    },
    [selectingEnd, selectedRange.start, isDragging]
  );
  const handleDragStart = useCallback((date: Date) => {
    setIsDragging(true);
    setSelectedRange({ start: date, end: null });
    setSelectingEnd(false);
  }, []);

  const handleDragMove = useCallback(
    (date: Date) => {
      if (!isDragging || !selectedRange.start) return;
      setSelectedRange((prev) => ({ ...prev, end: date }));
    },
    [isDragging, selectedRange.start]
  );

  const handleDragEnd = useCallback(() => {
    if (isDragging && selectedRange.start) {
      if (!selectedRange.end) {
        setSelectingEnd(true);
      } else {
        const s = selectedRange.start;
        const e = selectedRange.end;
        setSelectedRange(
          isBefore(e, s) ? { start: e, end: s } : { start: s, end: e }
        );
        setSelectingEnd(false);
      }
    }
    setIsDragging(false);
  }, [isDragging, selectedRange]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement) && !focusedDate) return;

      const currentFocus = focusedDate || days.find((d) => d.isToday)?.date || days[0]?.date;
      if (!currentFocus) return;

      let newDate: Date | null = null;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          newDate = addDays(currentFocus, 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          newDate = subDays(currentFocus, 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          newDate = addDays(currentFocus, 7);
          break;
        case "ArrowUp":
          e.preventDefault();
          newDate = subDays(currentFocus, 7);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (currentFocus) handleDayClick(currentFocus);
          return;
        case "Escape":
          e.preventDefault();
          setSelectedRange({ start: null, end: null });
          setSelectingEnd(false);
          return;
      }

      if (newDate) {
        setFocusedDate(newDate);
        const newMonth = newDate.getMonth();
        const curMonth = currentMonth.getMonth();
        const curYear = currentMonth.getFullYear();
        const newYear = newDate.getFullYear();
        if (newMonth !== curMonth || newYear !== curYear) {
          setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedDate, days, currentMonth, handleDayClick]);
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) handleDragEnd();
    };
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleDragEnd]);

  const handleAddNote = useCallback(
    (text: string, range?: DateRange) => {
      const newNote: Note = {
        id: crypto.randomUUID(),
        text,
        dateRange: range,
        createdAt: new Date(),
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      saveNotes(updated);
    },
    [notes]
  );

  const handleDeleteNote = useCallback(
    (id: string) => {
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      saveNotes(updated);
    },
    [notes]
  );

  const seasonLabel = season.charAt(0).toUpperCase() + season.slice(1);

  return (
    <div className="w-full max-w-2xl mx-auto px-1 sm:px-0" ref={containerRef} tabIndex={-1}>
      
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3 px-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass glass-highlight text-accent-foreground text-xs font-semibold tracking-wide transition-all duration-500">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {seasonLabel} Theme
        </span>
        <TodayButton onGoToday={handleGoToday} isCurrentMonth={isCurrentMonth} />
        <CountdownBadge currentMonth={currentMonth} />
        <button
          onClick={() => setShowYearOverview((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass glass-highlight text-accent-foreground text-xs font-semibold tracking-wide transition-all duration-300 hover:ring-1 hover:ring-primary/30 cursor-pointer"
        >
          {showYearOverview ? "Calendar" : `${currentMonth.getFullYear()} Overview`}
        </button>
      </div>

      <div className="glass glass-shimmer glass-highlight rounded-2xl overflow-hidden pt-3 transition-all duration-500">
        <ViewTransition viewKey={showYearOverview ? "year" : "month"}>
          {showYearOverview ? (
            <YearOverview
              year={currentMonth.getFullYear()}
              currentMonth={currentMonth}
              selectedRange={selectedRange}
              onMonthClick={(month) => {
                setCurrentMonth(month);
                setShowYearOverview(false);
              }}
            />
          ) : (
            <>
              <div className={animating ? "page-flip-exit" : "page-flip-enter"}>
                <CalendarHero
                  currentMonth={currentMonth}
                  onPrevMonth={() => handleMonthChange("prev")}
                  onNextMonth={() => handleMonthChange("next")}
                />
              </div>

              <div className="flex flex-col lg:flex-row">
                <div className="flex-1">
                  <CalendarGrid
                    days={days}
                    selectedRange={selectedRange}
                    onDayClick={handleDayClick}
                    hoverDate={hoverDate}
                    onDayHover={setHoverDate}
                    focusedDate={focusedDate}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    isDragging={isDragging}
                  />
                </div>
              </div>

              <NotesSection
                notes={notes}
                selectedRange={selectedRange}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
              />
            </>
          )}
        </ViewTransition>
      </div>

      
      <div className="text-center mt-4 space-y-1">
        <p className="text-xs text-muted-foreground/80 glass-subtle inline-block px-4 py-1.5 rounded-full">
          {selectingEnd
            ? "Click another date to complete the range"
            : "Click a date to start selecting, or drag across dates"}
        </p>
        <p className="text-[10px] text-muted-foreground/50">
          ← → ↑ ↓ Navigate &nbsp;·&nbsp; Enter Select &nbsp;·&nbsp; Esc Clear
        </p>
      </div>
    </div>
  );
}

