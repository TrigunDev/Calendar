import { CalendarCheck } from "lucide-react";

interface TodayButtonProps {
  onGoToday: () => void;
  isCurrentMonth: boolean;
}

export default function TodayButton({ onGoToday, isCurrentMonth }: TodayButtonProps) {
  if (isCurrentMonth) return null;

  return (
    <button
      onClick={onGoToday}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass glass-highlight text-accent-foreground text-xs font-semibold tracking-wide transition-all duration-300 hover:ring-1 hover:ring-primary/40 cursor-pointer animate-fade-in animate-pulse-glow"
      aria-label="Go to today"
    >
      <CalendarCheck className="w-3 h-3" />
      Today
    </button>
  );
}
