"use client"
import Button from "@/app/components/button";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import React from "react";

export default function Calendars() {
  return (
    <div className="flex items-start">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="flex flex-col pb-12">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-bold">
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
          {/* {error.apiError && <ApiError errorMessage={error.apiError} />} */}
        </div>
      </div>
    </div>
  );
}
