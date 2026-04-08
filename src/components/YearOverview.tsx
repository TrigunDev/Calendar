import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  isWeekend,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/lib/calendar-utils";
import { isInRange } from "@/lib/calendar-utils";

interface YearOverviewProps {
  year: number;
  currentMonth: Date;
  selectedRange: DateRange;
  onMonthClick: (month: Date) => void;
}

function MiniMonth({
  month,
  isCurrent,
  selectedRange,
  onClick,
  index,
}: {
  month: Date;
  isCurrent: boolean;
  selectedRange: DateRange;
  onClick: () => void;
  index: number;
}) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const today = new Date();

  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded-xl text-left transition-all duration-300 cursor-pointer group animate-stagger-in",
        "glass-subtle glass-shimmer hover:glass hover:glass-highlight hover:scale-[1.03]",
        isCurrent && "glass ring-1 ring-primary/40 glass-highlight"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <p
        className={cn(
          "text-[10px] font-semibold tracking-wider uppercase mb-1 transition-colors",
          isCurrent ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        {format(month, "MMM")}
      </p>
      <div className="grid grid-cols-7 gap-px">
        {days.slice(0, 42).map((day, i) => {
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const inRange = isInRange(day, selectedRange);

          return (
            <div
              key={i}
              className={cn(
                "w-[10px] h-[10px] flex items-center justify-center rounded-full text-[5px] font-medium leading-none transition-colors duration-200",
                !inMonth && "opacity-0",
                inMonth && "text-foreground/70",
                isToday && "bg-primary text-primary-foreground",
                inRange && !isToday && "bg-calendar-range text-calendar-range-foreground",
                isWeekend(day) && inMonth && !isToday && !inRange && "text-calendar-weekend/60"
              )}
            >
              {inMonth ? day.getDate() : ""}
            </div>
          );
        })}
      </div>
    </button>
  );
}

export default function YearOverview({
  year,
  currentMonth,
  selectedRange,
  onMonthClick,
}: YearOverviewProps) {
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Date(year, i, 1)),
    [year]
  );

  return (
    <div className="p-3 md:p-4">
      <h3 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-3 text-center animate-fade-in">
        {year} Overview
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {months.map((month, i) => (
          <MiniMonth
            key={i}
            month={month}
            index={i}
            isCurrent={isSameMonth(month, currentMonth)}
            selectedRange={selectedRange}
            onClick={() => onMonthClick(month)}
          />
        ))}
      </div>
    </div>
  );
}
