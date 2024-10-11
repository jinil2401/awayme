"use client";
import Button from "@/app/components/button";
import { useUserContext } from "@/context/userContext";
import { useRouter, useSearchParams } from "next/navigation";

const CustomErrorPage = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const searchParams = useSearchParams();
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-center font-archivo text-2xl leading-[48px] text-heading font-semibold">
          Error: {searchParams.get("error")}
        </h1>
        <p className="text-center text-base leading-[24px] font-medium text-subHeading mx-auto">
          There was a error occured while importing the calendar. <br /> Please
          navigate back to dashboard.
        </p>
        <div className="flex justify-center mt-6">
          <Button
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
            buttonText="Go To Calendars"
            onClick={() => router.push(`/application/${user?._id}/calendars`)}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomErrorPage;
