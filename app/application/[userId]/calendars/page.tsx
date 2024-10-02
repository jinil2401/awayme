import Sidebar from '@/app/components/sidebar'
import TopBar from '@/app/components/topbar'
import React from 'react'

export default function Calendars() {
  return (
    <div className="flex items-start">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="flex items-center gap-12 pb-12">
            <h3 className="font-archivo text-2xl leading-xl text-black font-workSans">
              Hello from Calendars
            </h3>
          </div>
          {/* {error.apiError && <ApiError errorMessage={error.apiError} />} */}
        </div>
      </div>
    </div>
  )
}
