"use client";

import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import React, { useState, useEffect } from "react";
import { IPlan } from "./interface";
import { useUserContext } from "@/context/userContext";
import { fetchData, postData } from "@/utils/fetch";
import PlanCard from "@/app/components/plan-card";
import { PlanTypes } from "@/utils/planTypes";
import ApiError from "@/app/components/api-error";

export default function Billing() {
  const { user } = useUserContext();
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    apiError: "",
  });
  const [checkoutLoading, setCheckoutLoading] = useState<{
    planId: string;
    isLoading: boolean;
  }>({
    planId: "",
    isLoading: false,
  });

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const response = await fetchData("/api/plans");
        const { data } = response;
        setPlans(data);
      } catch (err: any) {
        setError((error) => ({
          ...error,
          apiError: err.message,
        }));
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  async function handleCheckout(planId: string) {
    setCheckoutLoading({ planId, isLoading: true });

    try {
      const response = await postData(`/api/checkout`, {
        planId,
        userId: user._id,
      });
      const { sessionUrl } = response?.data;
      window.location.href = sessionUrl;
    } catch (error) {
      setError((err: any) => ({
        ...err,
        apiError: err?.message,
      }));
    } finally {
      setCheckoutLoading({ planId, isLoading: false });
    }
  }

  function renderPlanCards() {
    if (isLoading) {
      return (
        <p className="text-base leading-[24px] text-heading mt-4">
          Fetching plans!
        </p>
      );
    }
    if (plans.length <= 0) {
      return (
        <p className="text-base leading-[24px] text-heading mt-4">
          No Plans Found
        </p>
      );
    }
    return (
      <div className="flex items-start gap-4 mt-8">
        {plans.map((plan: IPlan) => (
          <PlanCard
            key={plan?._id}
            plan={plan}
            isCurrentPlan={plan?._id === user?.plan?._id}
            isLoading={
              checkoutLoading.planId === plan._id && checkoutLoading.isLoading
            }
            isPlanFree={
              plan?.planId?.toLowerCase() === PlanTypes.FREE.toLowerCase()
            }
            onUpgrade={(plan) => handleCheckout(plan._id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-start">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="flex flex-col pb-8">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              Billing
            </h3>
            <p className="text-base leading-[24px] text-subHeading">
              you are currently on the{" "}
              <span className="font-bold text-accent">{user?.plan?.name}</span>{" "}
              of Awayme.
            </p>
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
            {renderPlanCards()}
          </div>
        </div>
      </div>
    </div>
  );
}
