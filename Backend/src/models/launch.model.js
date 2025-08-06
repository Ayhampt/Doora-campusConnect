import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const serviceSchema = new Schema({
  
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
  images: {
    required: true,
    type:String
  },
});
serviceSchema.plugin(mongooseAggregatePaginate);
export const Service = mongoose.model("Service", serviceSchema);
