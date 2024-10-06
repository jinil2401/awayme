"use client"; 

import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import Button from "@/app/components/button";
import React from "react";

export default function Billing() {
  return (
    <section className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <TopBar />
        <article className="flex-grow overflow-auto p-8">
          <section>
            <header className="mb-6">
              <h1 className="text-lg font-bold mb-2">Billing</h1>
              <p className="text-gray-500">
                You currently are on <strong className="text-gray-500">Free Version</strong> of Awayme
              </p>
            </header>

            <section className="grid grid-cols-2 gap-8">
              {/* Free Version */}
              <aside className="bg-white shadow rounded-lg p-6 h-80 w-80">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Free Version</h2>
                  <div className="text-sm text-white py-1 px-3 bg-black rounded-full">
                    Current Plan
                  </div>
                </div>
                <ul className="space-y-6">
                  <li className="flex items-center gap-2 font-semibold">
                    ✓ One Calendar per account
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    ✓ Fill up to 20% capacity
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    ✓ Static Event Names and Details
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    ✓ Fill up to two weeks at a time
                  </li>
                </ul>
              </aside>

              {/* Pro Version */}
              <aside className="bg-white shadow rounded-lg p-3 h-80 w-80">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Pro Version</h2>
                </div>
                <ul className="space-y-6">
                  <li className="flex items-center gap-2 font-semibold">
                    ✓ Up to 3 Calendars per Account
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    ✓ Fill up to 100% capacity
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    ✓ Random Event Names and Details
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    ✓ Fill up to 2 months at a time
                  </li>
                </ul>
                <footer className="mt-6 flex justify-center items-center">
                  <Button
                    buttonText="Upgrade Now"
                    buttonClassName="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    onClick={() => console.log("Upgrade Now clicked")}
                  />
                </footer>
              </aside>
            </section>
          </section>
        </article>
      </main>
    </section>
  );
}
