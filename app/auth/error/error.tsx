"use client"
import { useSearchParams } from "next/navigation";

const CustomErrorPage = () => {
    const searchParams = useSearchParams();
  return (
    <div>
      <h1>Error: {searchParams.get("error")}</h1>
    </div>
  );
};

export default CustomErrorPage;