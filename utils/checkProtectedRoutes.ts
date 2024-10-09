import { IUser } from "@/context/userContext";
import { PlanTypes } from "./planTypes";

export function isRouteProtected(url: string) {
  if (url.includes("/api/users")) {
    return true;
  }
  return false;
}

export function isPaidUser(user: IUser) {
  return user.plan.planId.toLowerCase() !== PlanTypes.FREE.toLowerCase();
}