"use client";
import { ICalendar } from "@/app/application/[userId]/calendars/interface";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { fetchData } from "@/utils/fetch";
import { redirect } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const Context = createContext<{
  calendars: ICalendar[];
  setCalendars: (calendars: ICalendar[]) => void;
  toggleFetchUserCalendars: boolean;
  setToggleFetchUserCalendars: (value: boolean) => void;
}>({
  calendars: [],
  setCalendars: () => {},
  toggleFetchUserCalendars: false,
  setToggleFetchUserCalendars: () => {},
});

export function CalendarContext({ children }: { children: React.ReactNode }) {
  const userId =
    (typeof window !== "undefined" && localStorage.getItem("userId")) ?? "";
  const [calendars, setCalendars] = useState<ICalendar[]>([]);
  const [toggleFetchUserCalendars, setToggleFetchUserCalendars] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>();

  useEffect(() => {
    async function getUserCalendars(userId: string) {
      try {
        const response = await fetchData(`/api/calendars?userId=${userId}`);
        const { data } = response;
        setCalendars(
          data?.map((calendar: ICalendar) => {
            const name = calendar?.name || "";
            return {
             ...calendar,
              name: capitalizeFirstLetter(name),
            };
          })
        );
      } catch (err: any) {
        // TODO: Shoot a toast message here
        redirect(`/application/${userId}/calendars`);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      setIsLoading(true);
      getUserCalendars(userId);
    }

    return () => {
      setIsLoading(false);
    };
  }, [userId, toggleFetchUserCalendars]);

  return (
    <Context.Provider
      value={{
        calendars,
        setCalendars,
        toggleFetchUserCalendars,
        setToggleFetchUserCalendars,
      }}
    >
      {isLoading ? (
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm leading-5 font-medium text-black text-center">
              Fetching your calendars. Please hang on a sec!
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </Context.Provider>
  );
}

export function useCalendarContext() {
  return useContext(Context);
}
