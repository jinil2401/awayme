"use client";
import Dropdown from "@/app/components/dropdown";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useCalendarContext } from "@/context/calendarContext";
import { useUserContext } from "@/context/userContext";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ICalendar } from "../../calendars/interface";
import { fetchData } from "@/utils/fetch";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import { useRouter } from "next/navigation";
import MyCalendar from "@/app/components/calendar";

export default function MergeCalendar() {
  const router = useRouter();
  const { user } = useUserContext();
  const { calendars } = useCalendarContext();
  const [sourceCalendar, setSourceCalendar] = useState<ICalendar>(calendars[0]);
  const [destinationCalendar, setDestinationCalendar] = useState<ICalendar>(
    calendars[1]
  );
  const [fetchEvents, setFetchEvents] = useState(false);
  const [sourceEvents, setSourceEvents] = useState<any>([]);
  const [destinationEvents, setDestinationEvents] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    apiError: "",
  });

  const fetchSourceEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetchData(
        `/api/calendar-events?calendarId=${sourceCalendar?._id}&userId=${user?._id}`
      );
      const { data } = response;
      const events = data?.map((eventData: any) => ({
        id: eventData?.id,
        title: eventData?.summary,
        start: new Date(eventData?.start?.dateTime),
        end: new Date(eventData?.end?.dateTime),
      }));
      setSourceEvents(events);
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    }
  };

  const fetchDestinationEvents = async () => {
    try {
      const response = await fetchData(
        `/api/calendar-events?calendarId=${destinationCalendar?._id}&userId=${user?._id}`
      );
      const { data } = response;
      const events = data?.map((eventData: any) => ({
        id: eventData?.id,
        title: eventData?.summary,
        start: new Date(eventData?.start?.dateTime),
        end: new Date(eventData?.end?.dateTime),
        data: {
          type: "multi-calendar",
        },
      }));
      setDestinationEvents(events);
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fetchEvents) {
      fetchSourceEvents();
      fetchDestinationEvents();
    }
  }, [fetchEvents]);

  function renderButtonState() {
    if (isLoading) {
      return (
        <div className="text-heading text-lg mt-4">
          Fetching your calendar events
        </div>
      );
    }
    if (fetchEvents) {
      return (
        <div className="flex flex-col gap-8 mt-4">
          <div className="text-subHeading text-lg">
            Please confirm the events you want to transfer from the source
            calendar to the destination calendar.
          </div>
          <div className="flex items-center gap-8">
            <Button
              buttonText="Cancel"
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-subHeading text-white"
              onClick={() => setFetchEvents(false)}
            />
            <Button
              buttonText="Confirm"
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
              onClick={() => {
                console.log(
                  "I will fill the destination canlendar with source events..."
                );
                setFetchEvents(false);
              }}
            />
          </div>
          <div className="w-[80%] bg-white border border-stroke/20 rounded-[12px] p-5 shadow-card">
            <MyCalendar events={[...sourceEvents, ...destinationEvents]} />
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-8 mt-4">
        <Button
          buttonText="Cancel"
          buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-subHeading text-white"
          onClick={() => router.push(`/application/${user?._id}/dashboard`)}
        />
        <Button
          buttonText="Confirm"
          buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
          onClick={() => setFetchEvents(true)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-start">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="my-2">
            <Link
              href={`/application/${user?._id}/dashboard`}
              className="text-heading underline font-medium text-md leading-md"
            >
              Dashboard
            </Link>
          </div>
          <div className="flex flex-col pb-12">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              Merge Calendar
            </h3>
            <p className="text-lg leading-[36px] text-subHeading">
              Select the source and the designation calendar. All the events
              from source will be merged into the destination calendar
            </p>
            <div className="flex items-center gap-8 mt-4">
              <Dropdown
                isDisabled={fetchEvents}
                id="sourceCalendar"
                label="Select Source Calendar"
                onClick={(value) => {
                  const calendar: any = calendars.find(
                    (calendar) => calendar?._id === value?.id
                  );
                  setSourceCalendar(calendar);
                }}
                options={calendars?.map(({ _id = "", name = "" }) => ({
                  id: _id,
                  name,
                }))}
                selectedOption={{
                  id: sourceCalendar?._id || "",
                  name: sourceCalendar?.name || "",
                }}
              />
              <img src="/arrow-right.svg" alt="Arrow Right svg" />
              <Dropdown
                isDisabled={fetchEvents}
                id="destinationCalendar"
                label="Select Destination Calendar"
                onClick={(value) => {
                  const calendar: any = calendars.find(
                    (calendar) => calendar?._id === value?.id
                  );
                  setDestinationCalendar(calendar);
                }}
                options={calendars
                  ?.filter((calendar) => calendar._id !== sourceCalendar?._id)
                  ?.map(({ _id = "", name = "" }) => ({
                    id: _id,
                    name,
                  }))}
                selectedOption={{
                  id: destinationCalendar?._id || "",
                  name: destinationCalendar?.name || "",
                }}
              />
            </div>
            {error.apiError && (
            <ApiError
              message={error.apiError}
              setMessage={(value) =>
                setError((error) => ({
                  ...error,
                  apiError: value,
                }))
              }
            />
          )}
            {renderButtonState()}
          </div>
        </div>
      </div>
    </div>
  );
}
