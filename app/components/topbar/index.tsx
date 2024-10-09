"use client";
import { useUserContext } from "@/context/userContext";
import { fetchData } from "@/utils/fetch";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ApiError from "../api-error";
import Button from "../button";
import LogoutSvg from "../svg/Logout";

export default function TopBar() {
  const router = useRouter();

  const { user } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    apiError: "",
  });

  async function handleLogout() {
    setIsLoading(true);
    try {
      const response = await fetchData("/api/logout");
      const { message } = response;
      console.log(message);
      return router.replace("/login");
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setIsLoading(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
      }
    }
  }

  return (
    <div className="py-6 px-8 flex items-center">
      <h2 className="font-archivo text-[32px] leading-[48px] text-heading font-bold">
        Hello, {user.firstName} {user.lastName} 👋🏻
      </h2>
      <div className="ml-auto">
        <>
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
          {isLoading ? (
            <div className="py-2">
              <p>Loging you out!</p>
            </div>
          ) : (
            <Button
              isDisabled={isLoading}
              isLoading={isLoading}
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#FDE4E4] text-[#913838] px-4 py-2"
              buttonText="Logout"
              hasIcon
              icon={<LogoutSvg />}
              onClick={() => handleLogout()}
            />
          )}
        </>
      </div>
    </div>
  );
}
