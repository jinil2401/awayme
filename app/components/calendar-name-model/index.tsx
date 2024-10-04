"use client";
import { useUserContext } from "@/context/userContext";
import React, { useState } from "react";
import Input from "../input";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import CloseSvg from "../svg/Close";
import Button from "../button";
import { postData } from "@/utils/fetch";

export default function CalendarNameModel({
  accountType,
  onCancel,
  onConfirm,
}: {
  accountType: string;
  onCancel: () => void;
  onConfirm: (accountType: string) => void;
}) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    nameError: "",
    apiError: "",
  });


  async function handleAddCalendarName() {
    if(name === ""){
        setError({...error, nameError: "Please enter a calendar name" });
        return;
    }
    setIsLoading(true);
    try {
      const response = await postData("/api/store-calendar-name-in-cookies", {
        name
      });
      const { data } = response;
      if (data) {
        // call the onConfirm function to close the modal and save the name in database
        onConfirm(accountType);
      }
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 h-[100vh] bg-black/20 flex items-center justify-center">
      <div className="w-[450px] p-8 rounded-[12px] bg-white shadow-card flex flex-col relative">
        <div className="absolute top-5 right-5">
          <button
            disabled={isLoading}
            className="border-0 bg-transparent"
            onClick={() => onCancel()}
          >
            <CloseSvg />
          </button>
        </div>
        <h3 className="font-archivo text-2xl leading-[36px] text-heading font-bold">
          Import Calendar
        </h3>
        <div className="my-2">
          <Input
            type="text"
            hasLabel
            value={name}
            maxLength={40}
            label="Calendar Name"
            placeholder="Enter your calendar name"
            onChange={(event) => setName(event.target.value)}
            hasError={error.nameError !== ""}
            error={error.nameError}
            disabled={isLoading}
          />
        </div>
        <div className="my-2">
          <p className="block text-sm text-heading mb-2 font-inter">Provider</p>
          <p className="text-lg text-heading font-medium">
            {capitalizeFirstLetter(accountType)}
          </p>
        </div>
        <div className="mt-8 mb-2 flex items-center justify-center gap-4">
          <Button
            isDisabled={isLoading}
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-subHeading text-white"
            buttonText="Cancel"
            onClick={() => onCancel()}
          />
          <Button
            isDisabled={isLoading}
            isLoading={isLoading}
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
            buttonText="Confirm"
            onClick={() => handleAddCalendarName()}
          />
        </div>
      </div>
    </div>
  );
}
