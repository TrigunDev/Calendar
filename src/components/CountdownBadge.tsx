import { differenceInDays, endOfMonth, startOfMonth, isToday, eachDayOfInterval, isWeekend } from "date-fns";
import { Clock, CalendarDays } from "lucide-react";

interface CountdownBadgeProps {
  currentMonth: Date;
}

export default function CountdownBadge({ currentMonth }: CountdownBadgeProps) {
  const today = new Date();
  const monthEnd = endOfMonth(currentMonth);
  const monthStart = startOfMonth(currentMonth);
  const daysLeft = Math.max(0, differenceInDays(monthEnd, today) + 1);
  const remaining = today > monthEnd ? [] : eachDayOfInterval({
    start: today > monthStart ? today : monthStart,
    end: monthEnd,
  });
  const workdaysLeft = remaining.filter((d) => !isWeekend(d)).length;

  const isCurrentMonth =
    today.getMonth() === currentMonth.getMonth() &&
    today.getFullYear() === currentMonth.getFullYear();

  if (!isCurrentMonth) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass glass-highlight text-accent-foreground text-xs font-semibold tracking-wide animate-slide-up">
        <Clock className="w-3 h-3 text-primary" />
        <span>{daysLeft} days left</span>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass glass-highlight text-accent-foreground text-xs font-semibold tracking-wide animate-slide-up" style={{ animationDelay: "80ms" }}>
        <CalendarDays className="w-3 h-3 text-primary" />
        <span>{workdaysLeft} workdays</span>
      </div>
    </div>
  );
}

