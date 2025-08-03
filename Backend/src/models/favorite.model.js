import mongoose, { Schema } from "mongoose";

const favoriteSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    items: {
      type: [
        {
          serviceId: {
            type: Schema.Types.ObjectId,
            ref: "Service",
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Favorites = mongoose.model("favorites", favoriteSchema);
