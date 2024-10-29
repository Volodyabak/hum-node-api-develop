export class DateUtils {
  // Returns new date object with subtracted hourss
  static subtractHoursFromDate(date: Date, hours: number) {
    const newDate = new Date(date); //TRIGGER
    newDate.setHours(date.getHours() - hours);

    return newDate;
  }

  // Returns new date object with subtracted months
  static subtractMonthsFromDate(date: Date, month: number) {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() - month);

    return newDate;
  }

  // Returns new date object with subtracted days
  static subtractDaysFromDate(date: Date, days: number) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - days);

    return newDate;
  }

  // Returns number of months between two dates
  static getMonthsBetweenDates(start: Date, end: Date) {
    return end.getMonth() - start.getMonth() + 12 * (end.getFullYear() - start.getFullYear());
  }

  // Returns number of seconds passed from midnight
  static timeToSeconds(date: Date): number {
    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  }

  static toISODateString(date: Date) {
    return date.toISOString().split('T')[0];
  }
}
