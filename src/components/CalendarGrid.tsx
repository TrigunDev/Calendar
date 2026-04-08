import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import type { CalendarDay, DateRange } from "@/lib/calendar-utils";
import { isInRange, isRangeStart, isRangeEnd } from "@/lib/calendar-utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCallback, useRef } from "react";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface CalendarGridProps {
  days: CalendarDay[];
  selectedRange: DateRange;
  onDayClick: (date: Date) => void;
  hoverDate: Date | null;
  onDayHover: (date: Date | null) => void;
  focusedDate: Date | null;
  onDragStart: (date: Date) => void;
  onDragMove: (date: Date) => void;
  isDragging: boolean;
}

export default function CalendarGrid({
  days,
  selectedRange,
  onDayClick,
  hoverDate,
  onDayHover,
  focusedDate,
  onDragStart,
  onDragMove,
  isDragging,
}: CalendarGridProps) {
  const dragTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didDragRef = useRef(false);

  const getPreviewRange = (): DateRange => {
    if (isDragging && selectedRange.start) {
      return selectedRange;
    }
    if (selectedRange.start && !selectedRange.end && hoverDate) {
      return { start: selectedRange.start, end: hoverDate };
    }
    return selectedRange;
  };

  const previewRange = getPreviewRange();

  const handlePointerDown = useCallback(
    (date: Date, e: React.PointerEvent) => {
      e.preventDefault();
      didDragRef.current = false;
      dragTimerRef.current = setTimeout(() => {
        didDragRef.current = true;
        onDragStart(date);
      }, 150);
    },
    [onDragStart]
  );

  const handlePointerMove = useCallback(
    (date: Date) => {
      if (isDragging) {
        onDragMove(date);
      }
    },
    [isDragging, onDragMove]
  );

  const handlePointerUp = useCallback(
    (date: Date) => {
      if (dragTimerRef.current) {
        clearTimeout(dragTimerRef.current);
        dragTimerRef.current = null;
      }
      if (!didDragRef.current) {
        onDayClick(date);
      }
      didDragRef.current = false;
    },
    [onDayClick]
  );

  return (
    <div className="p-3 md:p-5 select-none" role="grid" aria-label="Calendar">
      
      <div className="grid grid-cols-7 mb-2" role="row">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            role="columnheader"
            className={cn(
              "text-center text-[10px] sm:text-xs font-semibold tracking-wide py-1.5 sm:py-2",
              i >= 5 ? "text-calendar-weekend" : "text-muted-foreground"
            )}
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      
      <div className="grid grid-cols-7 touch-none" role="rowgroup">
        {days.map((day, i) => {
          const inRange = isInRange(day.date, previewRange);
          const rangeStart = isRangeStart(day.date, previewRange);
          const rangeEnd = isRangeEnd(day.date, previewRange);
          const isSelected = rangeStart || rangeEnd;
          const isFocused = focusedDate && isSameDay(day.date, focusedDate);

          const dayContent = (
            <div
              key={i}
              role="gridcell"
              aria-selected={isSelected || inRange}
              aria-label={`${format(day.date, "EEEE, MMMM d, yyyy")}${day.isHoliday ? ` - ${day.holidayName}` : ""}`}
              tabIndex={isFocused ? 0 : -1}
              onPointerDown={(e) => handlePointerDown(day.date, e)}
              onPointerEnter={() => {
                onDayHover(day.date);
                handlePointerMove(day.date);
              }}
              onPointerLeave={() => {
                if (!isDragging) onDayHover(null);
              }}
              onPointerUp={() => handlePointerUp(day.date)}
              className={cn(
                "relative h-9 md:h-11 flex items-center justify-center text-sm md:text-base font-medium transition-all duration-200 cursor-pointer",
                inRange && !isSelected && "bg-calendar-range",
                rangeStart && "rounded-l-full",
                rangeEnd && "rounded-r-full",
                inRange && rangeStart && "bg-calendar-range",
                inRange && rangeEnd && "bg-calendar-range",
              )}
            >
              <span
                className={cn(
                  "relative z-10 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full transition-all duration-200",
                  !day.isCurrentMonth && "text-calendar-outside",
                  day.isCurrentMonth && day.isWeekend && "text-calendar-weekend",
                  day.isCurrentMonth && !day.isWeekend && "text-foreground",
                  day.isToday && !isSelected && "ring-2 ring-calendar-today ring-offset-1 ring-offset-card",
                  isSelected && "bg-primary text-primary-foreground shadow-md",
                  day.isHoliday && day.isCurrentMonth && !isSelected && "font-bold",
                  !isSelected && day.isCurrentMonth && "hover:bg-muted",
                  isFocused && !isSelected && "ring-2 ring-ring ring-offset-1 ring-offset-card"
                )}
              >
                {format(day.date, "d")}
                {day.isHoliday && day.isCurrentMonth && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-destructive" />
                )}
              </span>
            </div>
          );

          if (day.isHoliday && day.isCurrentMonth) {
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>{dayContent}</TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-medium">{day.holidayName}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return dayContent;
        })}
      </div>
    </div>
  );
}

