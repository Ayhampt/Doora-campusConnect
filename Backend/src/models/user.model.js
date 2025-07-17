import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    lastname: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: Number,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    refreshToken: {
      type: String,
    },
    avatar: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pinCode: String,
      country: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    businessName: {
      type: String,
      trim: true,
    },
    businessDescription: {
      type: String,
      trim: true,
    },
    certifications: [
      {
        name: String,
        issuer: String,
        dateIssued: Date,
        expiryDate: Date,
        documentUrl: String,
      },
    ],
    portfolio: [
      {
        title: String,
        description: String,
        imageUrl: String,
        projectDate: Date,
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
    
  },
  { timestamps: true }
);

//Password encryption using bcrypt

userSchema.pre("save", async function (next) {
  if (!this.modified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

//password decryption using bcrypt

userSchema.methods.isPasswordCorrect = async function (password) {
  await bcrypt.compare(password, this.password);
};

//generate accessToken

userSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      providerProfile: this.providerProfile,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_SECRET_KEY_EXPIRY }
  );
};
//generate refreshToken
userSchema.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: process.env.REFRESH_TOKEN_SECRET_KEY_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
