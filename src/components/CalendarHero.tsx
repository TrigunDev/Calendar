import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthHero } from "@/lib/calendar-utils";

interface CalendarHeroProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarHero({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}: CalendarHeroProps) {
  const heroImage = getMonthHero(currentMonth.getMonth());
  const year = format(currentMonth, "yyyy");
  const month = format(currentMonth, "MMMM").toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-t-lg">
      <div className="aspect-[16/9] md:aspect-[16/7] w-full overflow-hidden">
        <img
          src={heroImage}
          alt={`${month} ${year}`}
          className="w-full h-full object-cover transition-all duration-700"
          width={1920}
          height={1080}
        />
      </div>

      
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

      
      <div className="absolute bottom-0 right-0 w-2/3 h-16 md:h-20">
        <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
          <path d="M80,80 L400,80 L400,0 L0,80 Z" fill="hsl(var(--primary))" opacity="0.9" />
        </svg>
      </div>

      
      <div className="absolute bottom-3 right-4 md:bottom-5 md:right-8 z-10 text-right">
        <p className="text-sm md:text-base font-medium tracking-widest text-primary-foreground/80">
          {year}
        </p>
        <h2 className="text-xl md:text-3xl font-extrabold tracking-wider text-primary-foreground">
          {month}
        </h2>
      </div>

      
      <button
        onClick={onPrevMonth}
        className="absolute top-1/2 left-2 md:left-4 -translate-y-1/2 p-2 rounded-full glass glass-highlight hover:ring-1 hover:ring-primary-foreground/30 transition-all"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5 text-primary-foreground" />
      </button>
      <button
        onClick={onNextMonth}
        className="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 p-2 rounded-full glass glass-highlight hover:ring-1 hover:ring-primary-foreground/30 transition-all"
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5 text-primary-foreground" />
      </button>

      
      <div className="absolute top-0 left-0 right-0 flex justify-center gap-4 md:gap-6 -translate-y-1/2 z-20">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="calendar-ring-hole" />
        ))}
      </div>
    </div>
  );
}

