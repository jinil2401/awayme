import { Schema, model, models } from "mongoose";

const CalendarSchema = new Schema(
  {
    name: {
      type: String,
    },
    provider: {
        type: String,
    },
    access_token: {
        type: String,
    },
    refresh_token: {
        type: String,
    },
    expires_at: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

const Calendar = models.Calendar || model("Calendar", CalendarSchema);
export default Calendar;
