"use client";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import MyCalendar from "@/app/components/calendar";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useUserContext } from "@/context/userContext";
import { fetchData, postData } from "@/utils/fetch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ICalendar } from "../../calendars/interface";
import { useCalendarContext } from "@/context/calendarContext";
import Dropdown from "@/app/components/dropdown";
import { isPaidUser } from "@/utils/checkProtectedRoutes";
import { getFourMonthsLaterDate, getTwoWeeksLaterDate } from "@/utils/time";

export default function FillCalendar() {
  const router = useRouter();
  const { calendars } = useCalendarContext();
  const { user } = useUserContext();
  const [computedEvents, setComputedEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState<ICalendar>(
    calendars[0]
  );
  const [fetchEvents, setFetchEvents] = useState(false);
  const [isFetchingComputedEventsLoading, setIsFetchingComputedEventsLoading] =
    useState(false);
  const [isFillingCalendarLoading, setIsFillingCalendarLoading] =
    useState(false);
  const [error, setError] = useState({
    apiError: "",
  });

  async function fetchComputedEvents() {
    setFetchEvents(true);
    setIsFetchingComputedEventsLoading(true);
    try {
      // compute maxTime based on user plan
      const maxTime = isPaidUser(user) ? getFourMonthsLaterDate() : getTwoWeeksLaterDate();
      const response = await fetchData(
        `/api/compute-free-events?calendarId=${selectedCalendar?._id}&userId=${user?._id}&maxTime=${maxTime}`
      );
      const { data } = response;
      setUserEvents(data?.events);
      setComputedEvents(data?.computedEvents);
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setIsFetchingComputedEventsLoading(false);
    }
  }

  async function onFillCalendar() {
    try {
      setIsFillingCalendarLoading(true);
      const response = await await postData(`/api/fill-calendar`, {
        userId: user?._id,
        events: computedEvents,
        calendarId: selectedCalendar._id,
        isPaidUser: isPaidUser(user),
      });
      const { data } = response;
      const { message } = data;
      console.log(message);
      router.push(`/application/${user?._id}/dashboard`);
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setIsFillingCalendarLoading(false);
    }
  }

  function renderButtonState() {
    if (isFetchingComputedEventsLoading) {
      return (
        <div className="text-heading text-lg mt-4">
          Fetching computed events...
        </div>
      );
    }
    if (fetchEvents) {
      return (
        <div className="flex flex-col gap-8 mt-4">
          <div className="text-subHeading text-lg">
            Please confirm the events you want to create.
          </div>
          <div className="flex items-center gap-8">
            <Button
              isDisabled={isFillingCalendarLoading}
              buttonText="Cancel"
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-subHeading text-white"
              onClick={() => setFetchEvents(false)}
            />
            <Button
              isDisabled={isFillingCalendarLoading}
              isLoading={isFillingCalendarLoading}
              buttonText="Confirm"
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
              onClick={() => onFillCalendar()}
            />
          </div>
          <div className="w-[80%] bg-white border border-stroke/20 rounded-[12px] p-5 shadow-card">
            <MyCalendar
              events={[
                ...userEvents?.map((event: any) => ({
                  ...event,
                  title: event.summary,
                  start: new Date(event?.start?.dateTime),
                  end: new Date(event?.end?.dateTime),
                })),
                ...computedEvents?.map((event: any) => ({
                  ...event,
                  title: event.summary,
                  start: new Date(event?.start?.dateTime),
                  end: new Date(event?.end?.dateTime),
                  data: {
                    type: "multi-calendar",
                  },
                })),
              ]}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-8 mt-4">
        <Button
          isDisabled={isFetchingComputedEventsLoading}
          buttonText="Cancel"
          buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-subHeading text-white"
          onClick={() => router.push(`/application/${user?._id}/dashboard`)}
        />
        <Button
          isDisabled={isFetchingComputedEventsLoading}
          isLoading={isFetchingComputedEventsLoading}
          buttonText="Confirm"
          buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
          onClick={() => fetchComputedEvents()}
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
              Fill Calendar
            </h3>
            <p className="text-lg leading-[36px] text-subHeading">
              Select the Calendar to fill.
            </p>
            <div className="flex items-center gap-8 mt-4">
              <Dropdown
                isDisabled={fetchEvents}
                id="calendar"
                label="Select Calendar"
                onClick={(value) => {
                  const calendar: any = calendars.find(
                    (calendar) => calendar?._id === value?.id
                  );
                  setSelectedCalendar(calendar);
                }}
                options={calendars?.map(({ _id = "", name = "" }) => ({
                  id: _id,
                  name,
                }))}
                selectedOption={{
                  id: selectedCalendar?._id || "",
                  name: selectedCalendar?.name || "",
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
