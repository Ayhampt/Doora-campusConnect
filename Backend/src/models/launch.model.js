import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const LaunchSchema = new Schema({
  
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    enum: ["web development", "mobile app", "ai/ml", "data science", "game development", "iot", "blockchain", "cybersecurity", "ui/ux design", "other"],
    default: "other"
  },
  images: {
    required: true,
    type: String
  },
  
}, { timestamps: true });
LaunchSchema.plugin(mongooseAggregatePaginate);
export const Launch = mongoose.model("Launch", LaunchSchema);
