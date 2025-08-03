import mongoose,{Schema} from "mongoose";

const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Basic Info
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 1000,
    },

    // Professional Info
    skills: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    categories: [{
      type: String,
      enum: ['web development', 'graphic design', 'writing', 'marketing', 'video editing', 'data entry', 'other'],
      lowercase: true,
    }],
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'beginner',
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },

    // Portfolio & Work
    portfolio: [{
      title: String,
      description: String,
      projectUrl: String,
      imageUrl: String,
    }],

    // Social Links
    socialLinks: {
      website: String,
      github: String,
      linkedin: String,
      twitter: String,
      dribbble: String,
    },

    // Ratings & Reviews
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model('Profile', profileSchema);

