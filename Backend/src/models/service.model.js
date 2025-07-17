import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const serviceSchema = new Schema({
  //created by admin
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
  provider: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subcategory: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  pricing: {
    type: {
      type: Number,
      required: true,
    },
  },
  packages: [
    {
      name: String,
      description: String,
      price: Number,
      duration: String,
      features: [String],
    },
  ],
  images: [
    {
      url: String,
    },
  ],
  rating: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  bookingCount: {
    type: Number,
    default: 0,
  },
});
serviceSchema.plugin(mongooseAggregatePaginate);
export const Service = mongoose.model("Service", serviceSchema);
