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

export default function FillCalendar() {
  const router = useRouter();
  const { calendars } = useCalendarContext();
  const { user } = useUserContext();
  const [events, setEvents] = useState([]);
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

  useEffect(() => {
    async function fetchComputedEvents() {
      setIsFetchingComputedEventsLoading(true);
      try {
        const response = await fetchData("/api/compute-free-events");
        const { data } = response;
        setEvents(data);
      } catch (err: any) {
        setError((error) => ({
          ...error,
          apiError: err.message,
        }));
      } finally {
        setIsFetchingComputedEventsLoading(false);
      }
    }

    fetchComputedEvents();
  }, []);

  async function onFillCalendar() {
    try {
      setIsFillingCalendarLoading(true);
      const response = await await postData(`/api/fill-calendar`, {
        userId: user?._id,
        events,
        calendarId: selectedCalendar._id,
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
              events={events?.map((event: any) => ({
                id: event?.id,
                title: event?.summary,
                start: new Date(event?.start?.dateTime),
                end: new Date(event?.end?.dateTime),
              }))}
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
            {error.apiError && <ApiError errorMessage={error.apiError} />}
            {renderButtonState()}
          </div>
        </div>
      </div>
    </div>
  );
}
