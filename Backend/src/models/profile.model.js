import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
  {
    avatar: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Basic Info
    displayName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: 1000,
    },

    // Professional Info
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    categories: [
      {
        type: String,
        enum: [
          "web development",
          "graphic design",
          "writing",
          "marketing",
          "video editing",
          "app development",
          "photography",
          "music production",
          "other",
        ],
        lowercase: true,
      },
    ],
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      default: "beginner",
    },

    // Portfolio & Work
    portfolio: [
      {
        title: String,
        description: String,
        link: String,
        image: String,
      },
    ],

    // Social Links
    socialLinks: {
      website: String,
      github: String,
      linkedin: String,
      twitter: String,
      dribbble: String,
    },
    launches: [
      {
        type: Schema.Types.ObjectId,
        ref: "Launch",
      },
    ],
    eventsHosted:[
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      }
    ],
    eventsAttended:[
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      }
    ]
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model("Profile", profileSchema);
