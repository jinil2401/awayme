import { Schema, model, models } from "mongoose";

const PlanSchema = new Schema(
  {
    planId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
      type: String,
    },
    features: {
      type: Array<string>,
    },
    numberOfCalendarsAllowed: {
      type: Number,
    },
    price: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Plan = models.Plan || model("Plan", PlanSchema);
export default Plan;
