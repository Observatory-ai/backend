export class DateUtil {
  /**
   * Adds days to the given date
   * @param currentDate the current date
   * @param days the number of days to add, defaults to 1
   * @returns the new date
   */
  static addDays(currentDate: Date, days = 1): Date {
    const newDate: Date = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    return newDate;
  }

  /**
   * Removes days from the given date
   * @param currentDate the current date
   * @param days the number of days to remove, defaults to 1
   * @returns the new date
   */
  static removeDays(currentDate: Date, days = 1): Date {
    const newDate: Date = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - days);
    return newDate;
  }

  /**
   * Removes minutes from the given date
   * @param currentDate the current date
   * @param minutes the number of minutes to remove
   * @returns the new date
   */
  static removeMinutes(currentDate: Date, minutes: number): Date {
    const newDate: Date = new Date(currentDate);
    newDate.setMinutes(currentDate.getMinutes() - minutes);
    return newDate;
  }
}
