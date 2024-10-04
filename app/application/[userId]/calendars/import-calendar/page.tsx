"use client";
import CalendarNameModel from "@/app/components/calendar-name-model";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { CalendarTypes } from "@/constants/calendarTypes";
import { useUserContext } from "@/context/userContext";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";

export default function ImportCalendar() {
  const { user } = useUserContext();
  const [calendar, setCalendar] = useState({
    toggle: false,
    type: "",
  });
  return (
    <div className="flex items-start">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="my-2">
            <Link
              href={`/application/${user?._id}/calendars`}
              className="text-heading underline font-medium text-md leading-md"
            >
              Your Calendars
            </Link>
          </div>
          <div className="flex flex-col pb-12">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-bold">
              Import Calendar
            </h3>
            <p className="text-xl leading-[36px] text-subHeading">
              Select the provider. We only support Google and Microsoft for now.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <button
                type="button"
                className="w-[200px] h-[200px] bg-white border border-stroke/20 rounded-[12px] shadow-card flex flex-col items-center justify-center gap-6"
                onClick={() =>
                  setCalendar((calendar) => ({
                    ...calendar,
                    toggle: true,
                    type: CalendarTypes.GOOGLE,
                  }))
                }
              >
                <img
                  src="/google-icon.png"
                  alt="Google Icon"
                  className="w-[100px]"
                />
                <p className="text-md leading-md text-heading">Google</p>
              </button>
              <button
                type="button"
                className="w-[200px] h-[200px] bg-white border border-stroke/20 rounded-[12px] shadow-card flex flex-col items-center justify-center gap-6"
                onClick={() =>
                  setCalendar((calendar) => ({
                    ...calendar,
                    toggle: true,
                    type: CalendarTypes.OUTLOOK,
                  }))
                }
              >
                <img
                  src="/outlook-icon.png"
                  alt="Outlook Icon"
                  className="w-[100px]"
                />
                <p className="text-md leading-md text-heading">Microsoft</p>
              </button>
            </div>
          </div>
          {/* {error.apiError && <ApiError errorMessage={error.apiError} />} */}
        </div>
      </div>
      {calendar?.toggle && (
        <CalendarNameModel
          accountType={calendar.type}
          onCancel={() => {
            setCalendar((calendar) => ({
              ...calendar,
              type: "",
              toggle: false,
            }));
          }}
          onConfirm={(accountType: string) => {
            setCalendar((calendar) => ({
              ...calendar,
              type: "",
              toggle: false,
            }));
            if (
              accountType.toLowerCase() === CalendarTypes.GOOGLE.toLowerCase()
            ) {
              signIn("google",{
                redirect: true,
                callbackUrl: `/application/${user?._id}/calendars`,
              });
              return;
            }
            if (
              accountType.toLowerCase() === CalendarTypes.OUTLOOK.toLowerCase()
            ) {
              console.log("we will call the microsoft calendar api here...");
            }
          }}
        />
      )}
    </div>
  );
}
