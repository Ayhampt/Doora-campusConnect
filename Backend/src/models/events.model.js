import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming",
  },
  category: {
    type: String,
    enum: ["music", "sports", "tech", "education", "health", "other"],
    default: "other",
  },
  capacity: {
    type: Number,
    default: 0,
  },
  attendees: [
    {
      type: Schema.Types.ObjectId,
      ref: "User", 
    },
  ],
  image: {
    type: String,
  },
  bookLink: {
    type: String,
  },
  
},{timestamps: true});

eventSchema.plugin(mongooseAggregatePaginate);

export const Event = mongoose.model("Event", eventSchema);
