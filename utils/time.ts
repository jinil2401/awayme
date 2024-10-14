import moment from "moment";
import "moment-timezone";

export function getTwoWeeksLaterDate() {
  return moment().add(2, "weeks").toISOString();
}

export function getFourMonthsLaterDate() {
  return moment().add(3, "months").toISOString();
}

export function convertLocalToUtc(dateTimeStr: string, userTimeZone: string) {
  // Parse the local date string and convert it to UTC based on the specified time zone
  return moment.tz(dateTimeStr, userTimeZone).utc().format();
}

// Function to convert UTC to user's local time
export function convertUtcToLocal(utcTimeString: string, userTimeZone: string) {
  // Parse the UTC time string and convert it to the user's local time
  return moment.utc(utcTimeString).tz(userTimeZone).format();
}

export function getAllTimezones() {
  const tzNames = moment.tz.names();
  const currentTimezone = moment.tz.guess();

  return {
    tzNames,
    currentTimezone,
  };
}
