import React from "react";
import Button from "../button";

export default function DeleteModal({
  heading,
  subHeading,
  onCancel,
  onConfirm,
  isLoading,
}: {
  heading: string;
  subHeading: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="w-screen h-screen flex items-center justify-center fixed top-0 lef-0 bottom-0 right-0 bg-heading/25">
      <div className="w-[600px] p-8 bg-white shadow-card rounded-[24px] text-center flex flex-col items-center gap-8">
        <img
          src="/Warning.svg"
          alt="warning icon for delete modal"
          className="w-[100px] mx-auto"
        />
        <div>
          <h2 className="text-xl leading-xl text-heading font-workSans font-medium text-center max-w-[60%] mx-auto">
            {heading}
          </h2>
          <p className="max-w-[60%] mx-auto text-center text-subHeading pt-4 text-sm leading-6">
            {subHeading}
          </p>
        </div>
        <div className="flex items-center justify-center gap-8">
          <Button
            buttonText="Cancel"
            isDisabled={isLoading}
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-subHeading text-white"
            onClick={() => onCancel()}
          />
          <Button
            buttonText="Confirm Delete"
            isDisabled={isLoading}
            isLoading={isLoading}
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
            onClick={() => onConfirm()}
          />
        </div>
      </div>
    </div>
  );
}
