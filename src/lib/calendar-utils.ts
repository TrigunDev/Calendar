import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  format,
  addMonths,
  subMonths,
  addDays,
  subDays,
  isWeekend,
  isBefore,
  isAfter,
} from "date-fns";

import heroJanuary from "@/assets/calendar-hero-january.jpg";
import heroApril from "@/assets/calendar-hero-april.jpg";
import heroJuly from "@/assets/calendar-hero-july.jpg";
import heroOctober from "@/assets/calendar-hero-october.jpg";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface Note {
  id: string;
  text: string;
  dateRange?: DateRange;
  createdAt: Date;
}

export type Season = "winter" | "spring" | "summer" | "autumn";

const US_HOLIDAYS: Record<string, string> = {
  "01-01": "New Year's Day",
  "07-04": "Independence Day",
  "12-25": "Christmas Day",
  "02-14": "Valentine's Day",
  "10-31": "Halloween",
  "11-11": "Veterans Day",
};

export function getHoliday(date: Date): string | undefined {
  const key = format(date, "MM-dd");
  return US_HOLIDAYS[key];
}

export function getCalendarDays(month: Date): CalendarDay[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const today = new Date();

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(
    (date) => {
      const holiday = getHoliday(date);
      return {
        date,
        isCurrentMonth: isSameMonth(date, month),
        isToday: isSameDay(date, today),
        isWeekend: isWeekend(date),
        isHoliday: !!holiday,
        holidayName: holiday,
      };
    }
  );
}

export function isInRange(date: Date, range: DateRange): boolean {
  if (!range.start || !range.end) return false;
  const start = isBefore(range.start, range.end) ? range.start : range.end;
  const end = isAfter(range.start, range.end) ? range.start : range.end;
  return isWithinInterval(date, { start, end });
}

export function isRangeStart(date: Date, range: DateRange): boolean {
  if (!range.start) return false;
  const actualStart =
    range.end && isBefore(range.end, range.start) ? range.end : range.start;
  return isSameDay(date, actualStart);
}

export function isRangeEnd(date: Date, range: DateRange): boolean {
  if (!range.end) return false;
  const actualEnd =
    isBefore(range.end, range.start!) ? range.start! : range.end;
  return isSameDay(date, actualEnd);
}

export const MONTH_HEROES: Record<number, string> = {
  0: heroJanuary,
  1: heroJanuary,
  2: heroApril,
  3: heroApril,
  4: heroApril,
  5: heroJuly,
  6: heroJuly,
  7: heroJuly,
  8: heroOctober,
  9: heroOctober,
  10: heroOctober,
  11: heroJanuary,
};

export function getMonthHero(month: number): string {
  return MONTH_HEROES[month] || heroJanuary;
}

export function getSeason(month: number): Season {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

export const SEASON_THEMES: Record<Season, {
  primary: string;
  accent: string;
  accentForeground: string;
  calendarWeekend: string;
  calendarRange: string;
  calendarRangeForeground: string;
  calendarToday: string;
  ring: string;
}> = {
  winter: {
    primary: "207 90% 54%",
    accent: "207 90% 94%",
    accentForeground: "207 90% 34%",
    calendarWeekend: "207 90% 54%",
    calendarRange: "207 90% 94%",
    calendarRangeForeground: "207 90% 34%",
    calendarToday: "207 90% 54%",
    ring: "207 90% 54%",
  },
  spring: {
    primary: "142 60% 45%",
    accent: "142 60% 92%",
    accentForeground: "142 60% 28%",
    calendarWeekend: "142 60% 45%",
    calendarRange: "142 60% 92%",
    calendarRangeForeground: "142 60% 28%",
    calendarToday: "142 60% 45%",
    ring: "142 60% 45%",
  },
  summer: {
    primary: "32 95% 52%",
    accent: "32 95% 92%",
    accentForeground: "32 80% 30%",
    calendarWeekend: "32 95% 52%",
    calendarRange: "32 95% 92%",
    calendarRangeForeground: "32 80% 30%",
    calendarToday: "32 95% 52%",
    ring: "32 95% 52%",
  },
  autumn: {
    primary: "15 75% 50%",
    accent: "15 75% 92%",
    accentForeground: "15 65% 30%",
    calendarWeekend: "15 75% 50%",
    calendarRange: "15 75% 92%",
    calendarRangeForeground: "15 65% 30%",
    calendarToday: "15 75% 50%",
    ring: "15 75% 50%",
  },
};

export function applySeasonTheme(month: number) {
  const season = getSeason(month);
  const theme = SEASON_THEMES[season];
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
}

export function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem("calendar-notes");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        dateRange: n.dateRange
          ? {
              start: n.dateRange.start ? new Date(n.dateRange.start) : null,
              end: n.dateRange.end ? new Date(n.dateRange.end) : null,
            }
          : undefined,
      }));
    }
  } catch {}
  return [];
}

export function saveNotes(notes: Note[]) {
  localStorage.setItem("calendar-notes", JSON.stringify(notes));
}
