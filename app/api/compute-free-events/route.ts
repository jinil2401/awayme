import { NextResponse } from "next/server";

function getRandomTime() {
  const startHour = 9;
  const endHour = 17;
  const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
  const minute = Math.floor(Math.random() * 60);
  return { hour, minute };
}

function getRandomDuration(maxDuration: number) {
  return Math.floor(Math.random() * Math.min(maxDuration, 120)) + 30; // Duration between 30 to 120 minutes, or less if maxDuration is smaller
}

function getRandomWeekday() {
  const today = new Date();
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(today.getDate() + 14);

  let randomDate;
  do {
    randomDate = new Date(
      today.getTime() +
        Math.random() * (twoWeeksLater.getTime() - today.getTime())
    );
  } while (randomDate.getDay() === 0 || randomDate.getDay() === 6); // Skip weekends

  return randomDate;
}

function calculateTotalAvailableSlots() {
  const workHoursPerDay = 8; // 9am - 5pm
  const totalDays = 10; // Two weeks

  return workHoursPerDay * 60 * totalDays; // Total daytime minutes
}

function generateRandomEvents(targetMinutes: any, timeZone: string) {
  const events = [];
  let totalMinutes = 0;

  while (totalMinutes < targetMinutes) {
    const date = getRandomWeekday();
    const { hour, minute } = getRandomTime();
    date.setHours(hour, minute, 0, 0);

    const duration = getRandomDuration(targetMinutes - totalMinutes);
    const endDate = new Date(date.getTime() + duration * 60000);

    events.push({
      summary: "Awayme Event",
      description: "This event is created by Awayme.",
      start: {
        dateTime: date.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: timeZone,
      },
    });

    totalMinutes += duration;
  }
  return events;
}

export async function GET(request: Request) {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get user's timezone
    const totalAvailableSlots = calculateTotalAvailableSlots();
    const targetMinutes = totalAvailableSlots * 0.1; // 20% of total available time
    const events = generateRandomEvents(targetMinutes, timeZone);

    return new NextResponse(
      JSON.stringify({
        message: "Events computed successfully!",
        data: events,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in populating event " + err, {
      status: 500,
    });
  }
}
