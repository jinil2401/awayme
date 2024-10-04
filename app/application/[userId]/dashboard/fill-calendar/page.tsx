"use client"
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useUserContext } from "@/context/userContext";
import Link from "next/link";
import React from "react";

export default function FillCalendar() {
  const { user } = useUserContext();
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
          </div>
          {/* {error.apiError && <ApiError errorMessage={error.apiError} />} */}
        </div>
      </div>
    </div>
  );
}
