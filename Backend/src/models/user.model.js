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
      unique: true,
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

    isVerified: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
  },
  { timestamps: true }
);

//Password encryption using bcrypt

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

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
