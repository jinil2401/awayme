"use client";
import Button from "@/app/components/button";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useUserContext } from "@/context/userContext";
import { deleteData, fetchData } from "@/utils/fetch";
import React, { useCallback, useEffect, useState } from "react";
import { ICalendar } from "./interface";
import { useRouter } from "next/navigation";
import { CalendarTypes } from "@/constants/calendarTypes";
import ApiError from "@/app/components/api-error";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import ApiSuccess from "@/app/components/api-success";
import DeleteModal from "@/app/components/delete-modal";

export default function Calendars() {
  const router = useRouter();

  // CONTEXT
  const { user } = useUserContext();

  // STATES
  const [isLoading, setIsLoading] = useState(true);
  const [calendars, setCalendars] = useState<ICalendar[]>([]);
  const [deleteCalendarLoading, setDeleteCalendarLoading] = useState(false);
  const [successDeleteMessage, setSuccessDeleteMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    toggle: boolean;
    data: ICalendar;
  }>({
    toggle: false,
    data: {},
  });
  const [error, setError] = useState({
    apiError: "",
  });

  const fetchAllCalendars = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchData(`/api/calendars?userId=${user?._id}`);
      const { data } = response;
      setCalendars(data);
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCalendars();

    return () => {
      setIsLoading(false);
    };
  }, [fetchAllCalendars]);

  async function handleDeleteCalendar() {
    setDeleteCalendarLoading(true);
    try {
      const response = await deleteData("/api/calendars", {
        calendarId: deleteModal.data._id,
        userId: user?._id,
      });
      const { message } = response;
      setSuccessDeleteMessage(message);
      setDeleteModal({
        toggle: false,
        data: {},
      });
      fetchAllCalendars();
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setDeleteCalendarLoading(false);
    }
  }

  function renderCalendarList() {
    if (isLoading) {
      return (
        <p className="text-lg leading-[36px] text-heading">
          Fetching your calendars
        </p>
      );
    }

    if (calendars?.length <= 0) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-xl leading-[36px] text-subHeading">
            You do not have any calendars imported. Import the calendar to see
            the events on the dashboard page
          </p>
          <div className="flex">
            <Button
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
              buttonText="Import Calendar"
              onClick={() =>
                router.push(
                  `/application/${user?._id}/calendars/import-calendar`
                )
              }
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4 mt-6">
        {calendars.map((calendar: ICalendar) => {
          const isCalendarGoogle =
            calendar?.provider?.toLowerCase() ===
            CalendarTypes.GOOGLE.toLowerCase();
          return (
            <div className="w-[250px] bg-white border border-stroke/20 rounded-[12px] shadow-card flex flex-col gap-6 px-4 py-6">
              <img
                src={`${
                  isCalendarGoogle ? "/google-icon.png" : "/outlook-icon.png"
                }`}
                alt="Google Icon"
                className="w-[50px] mx-auto"
              />
              <hr />
              <div className="h-[70px]">
                <p className="text-sm text-subHeading">Name</p>
                <p className="text-base font-medium leading-md text-heading">
                  {capitalizeFirstLetter(calendar?.name || "")}
                </p>
              </div>
              <div>
                <p className="text-sm text-subHeading">Email</p>
                <p className="text-base font-medium leading-md text-heading break-words">
                  {capitalizeFirstLetter(calendar?.email || "")}
                </p>
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  buttonClassName="rounded-md hover:bg-error/20 bg-transparent text-error font-semibold"
                  buttonText="Remove Calendar"
                  onClick={() =>
                    setDeleteModal({
                      toggle: true,
                      data: calendar,
                    })
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-start">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          {error.apiError && <ApiError errorMessage={error.apiError} />}
          {successDeleteMessage && (
            <ApiSuccess
              message={successDeleteMessage}
              setMessage={(value) => setSuccessDeleteMessage(value)}
            />
          )}
          <div className="flex flex-col pb-12">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              Calendars
            </h3>
            <p className="text-xl leading-[36px] text-subHeading">
              Here are all the calendars you have imported. You can add more
              calendars here.
            </p>
            <div className="flex mt-6">
              <Button
                buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
                buttonText="Fill Calendar"
                onClick={() => console.log("Fill Calendar")}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
              <h3 className="font-archivo text-2xl leading-[36px] text-heading font-semibold">
                Your Calendars
              </h3>
              {calendars.length > 0 && (
                <Button
                  buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
                  buttonText="Import Calendar"
                  onClick={() =>
                    router.push(
                      `/application/${user?._id}/calendars/import-calendar`
                    )
                  }
                />
              )}
            </div>
            <div className="mb-8">{renderCalendarList()}</div>
          </div>
        </div>
      </div>
      {deleteModal.toggle && (
        <DeleteModal
          heading="Delete Product"
          subHeading={`Are you sure you want to delete your calendar named "${deleteModal.data.name}". Please keep in mind that these changes will not be reverted`}
          isLoading={deleteCalendarLoading}
          onCancel={() =>
            setDeleteModal({
              toggle: false,
              data: {},
            })
          }
          onConfirm={() => handleDeleteCalendar()}
        />
      )}
    </div>
  );
}
