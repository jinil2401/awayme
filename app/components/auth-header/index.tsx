import Link from "next/link";
import React from "react";

export default function AuthHeader() {
  return (
    <div className="w-full px-6 py-3 border border-b border-stroke/20 flex items-center">
      <Link href={"/"}>
        <img src="/logo.png" alt="Awayme Logo" className="h-12" />
      </Link>
    </div>
  );
}
