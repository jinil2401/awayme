"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { useUserContext } from "@/context/userContext";
import DashboardSvg from "../svg/Dashboard";
import CalendarSvg from "../svg/Calendar";
import AccountSvg from "../svg/Account";
import BillingSvg from "../svg/Billing";

export default function Sidebar() {
  const { user } = useUserContext();
  const pathname = usePathname().split("/");

  // CONSTANTS
  const SIDEBAR_ITEMS = ["Dashboard", "Calendars", "Account", "Billing"];

  const fetchIcon = (itemName: string, isActive: boolean) => {
    switch (itemName.toLowerCase()) {
      case "dashboard":
        return <DashboardSvg fill={isActive ? "#171A1F" : "#9095A0"} />;
      case "calendars":
        return <CalendarSvg fill={isActive ? "#171A1F" : "#9095A0"} />;
      case "account":
        return <AccountSvg fill={isActive ? "#171A1F" : "#9095A0"} />;
      case "billing":
        return <BillingSvg fill={isActive ? "#171A1F" : "#9095A0"} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-[250px] h-screen border border-r-stroke/20">
      <div className="py-6 pl-6 border border-b border-stroke/20">
        <Link href={"/"}>
          <img src="/logo.png" alt="Awayme Logo" className="h-12" />
        </Link>
      </div>
      <div className="flex flex-col gap-9 py-8 pl-6">
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            href={`/application/${user._id}/${item.toLowerCase()}`}
            key={item}
            className="flex items-center gap-1"
          >
            <div className="px-2">
              {fetchIcon(item, pathname.includes(item.toLowerCase()))}
            </div>
            <p
              className={`text-lg leading-[24px] ${
                pathname.includes(item.toLowerCase())
                  ? "text-heading font-bold"
                  : "text-subHeading"
              }`}
            >
              {item}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
