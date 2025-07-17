import mongoose,{Schema} from "mongoose";

const appointmentSchema = new Schema(
  {
    //should be visible to both customer and admin
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    appointmentDate: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    startTime: String,
    endTime: String,
    type: String,
    customerNotes: String,
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

  
export const Appointment = mongoose.model("Appointment", appointmentSchema);
