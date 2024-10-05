"use client";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { ICalendarProps } from "./interface";
import { useState } from "react";
import "./styles.css";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function MyCalendar(props: ICalendarProps) {
  const { events, eventColor = "#4D869C" } = props;
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const components: any = {
    event: (props: any) => {
      const eventData = props?.event?.data?.type;
      switch (eventData) {
        case "multi-calendar":
          return (
            <div
              style={{
                backgroundColor: "#854545",
                borderRadius: "0",
                borderWidth: "0",
                display: "block",
                color: "#fff",
                height: "100%",
              }}
            >
              {props?.event?.title}
            </div>
          );
        default:
          return (
            <div
              style={{
                backgroundColor: "#4D869C",
                borderRadius: "0",
                borderWidth: "0",
                display: "block",
                color: "#fff",
                height: "100%",
              }}
            >
              {props?.event?.title}
            </div>
          );
      }
    },
  };

  return (
    <div>
      <Calendar
        components={components}
        views={[Views.MONTH, Views.WEEK]}
        view={view} // Include the view prop
        date={date} // Include the date prop
        onView={(view: any) => setView(view)}
        localizer={localizer}
        events={events}
        // start time 8:00am
        min={new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8)}
        // end time 8:00pm
        max={new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20)}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        popup
        onNavigate={(date) => {
          setDate(new Date(date));
        }}
        eventPropGetter={() => {
          var style = {
            borderRadius: "10",
            borderWidth: "0",
            color: "#fff",
          };
          return {
            style: style,
          };
        }}
      />
    </div>
  );
}
