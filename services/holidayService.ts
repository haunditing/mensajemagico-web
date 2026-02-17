import { CountryCode } from "../types";

interface HolidayConfig {
  displayRules: {
    showFromDaysBefore: number;
    hideAfterDays: number;
  };
}

const HOLIDAY_CONFIG: HolidayConfig = {
  displayRules: {
    showFromDaysBefore: 10,
    hideAfterDays: 1,
  },
};

const getNthWeekdayOfMonth = (
  year: number,
  month: number, // 0-indexed (0 = Jan)
  n: number,
  weekday: number, // 0 = Sunday
): Date => {
  const date = new Date(year, month, 1);
  const diff = (weekday - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  date.setDate(date.getDate() + (n - 1) * 7);
  return date;
};

const getHolidayDates = (
  occasionId: string,
  country: CountryCode,
  year: number,
): Date[] => {
  const dates: Date[] = [];

  if (occasionId === "mothers_day") {
    if (country === "MX") {
      dates.push(new Date(year, 4, 10)); // May 10
    } else if (country === "AR") {
      dates.push(getNthWeekdayOfMonth(year, 9, 3, 0)); // Oct, 3rd Sunday
    } else {
      dates.push(getNthWeekdayOfMonth(year, 4, 2, 0)); // May, 2nd Sunday
    }
  } else if (occasionId === "fathers_day") {
    if (country === "UY") {
      dates.push(getNthWeekdayOfMonth(year, 6, 2, 0)); // July, 2nd Sunday
    } else {
      dates.push(getNthWeekdayOfMonth(year, 5, 3, 0)); // June, 3rd Sunday
    }
  } else if (occasionId === "christmas") {
    dates.push(new Date(year, 11, 25));
  } else if (occasionId === "amor") {
    dates.push(new Date(year, 1, 14));
    if (country === "CO") {
      dates.push(getNthWeekdayOfMonth(year, 8, 3, 6)); // Sept, 3rd Saturday
    }
  }

  return dates;
};

export const isOccasionActive = (
  occasionId: string,
  country: CountryCode,
): boolean => {
  const restrictedOccasions = [
    "mothers_day",
    "fathers_day",
    "christmas",
    "amor",
  ];

  // Si no es una festividad restringida, siempre está activa
  if (!restrictedOccasions.includes(occasionId)) {
    return true;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const currentYear = now.getFullYear();

  const dates = getHolidayDates(occasionId, country, currentYear);

  const { showFromDaysBefore, hideAfterDays } = HOLIDAY_CONFIG.displayRules;

  return dates.some((eventDate) => {
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Mostrar si estamos dentro del rango: [Evento - 10 días, Evento + 1 día]
    return diffDays <= showFromDaysBefore && diffDays >= -hideAfterDays;
  });
};
