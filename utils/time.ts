import moment from "moment";
import momentTimeZone from "moment-timezone";

export function getTwoWeeksLaterDate() {
  return moment().add(2, "weeks").toISOString();
}

export function getFourMonthsLaterDate() {
  return moment().add(3, "months").toISOString();
}

// Function to convert UTC to user's local time
export function convertUtcToLocal(utcTimeString: string, userTimeZone: string) {
  // Parse the UTC time string and convert it to the user's local time
  const localTime = momentTimeZone.utc(utcTimeString).tz(userTimeZone);
  return localTime;
}
