import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const bookingSchema = new Schema({
  //booking done by customer
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
  status: {
    type: String,
    enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledTime: {
    start: String,
    end: String,
  },

  address: {
    type: String,
    trim: true,
  },

  pricing: {
    type: Number,
    required: true,
  },
  payment: {
    status: {
      type: String,
      enum: ["pending", "paid", "partially_paid", "refunded", "failed"],
      default: "pending",
      transactionId: {
        type: String,
        trim: true,
      },
      paidAt: {
        type: Date,
      },
    },
  },
  appointmentCreated: {
    type: Boolean,
    default: false,
  },
  
  customerRequirements: {
    type: String,
    trim: true,
  },
  Notes: {
    type: String,
    trim: true,
  },
  //payment id strings
});
bookingSchema.plugin(mongooseAggregatePaginate);
export const Booking = mongoose.model("Booking", bookingSchema);
