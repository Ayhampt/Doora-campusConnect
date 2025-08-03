import mongoose,{Schema} from "mongoose";
const dashboardSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  projects: [
    {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
      projectName: { type: String },
      projectStatus: {
        type: String,
        enum: ["new","active","in_progress", "completed"],
      },
    },
  ],
  ratings: [
    {
      rating: { type: Number },
      review: { type: String },
      reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
},{timestamps: true});
export const Dashboard = mongoose.model("Dashboard",dashboardSchema);