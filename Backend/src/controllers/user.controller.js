import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/mailer.js";

//generate access token and refresh token
const generateAcessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await generateAccessToken();
    const refreshToken = await generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "somthing went wrong while generating access and refresh token"
    );
  }
};

//register user
const registerUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password, phone, role } = req.body;
  if (firstname?.trim() === "") {
    throw new ApiError(400, "firstname required");
  }

  const userExist = await User.findOne({
    $or: [{ email: email?.toLowerCase() }, { phone: phone }],
  });

  if (userExist) {
    throw new ApiError(409, "user already exist");
  }

  //upload avatar using multer
  console.warn(req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "upload a avatar");
  }
  let avatar
  try {
     avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("uploaded avatar", avatar);
  } catch (error) {
    console.log("error uploading avatar", error);
    throw new ApiError(500, "failed to upload avatar");
  }

  const user = await User.create({
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: password,
    phone: phone,
    role: role?.role || "customer",
    avatar: avatar?.url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "somthing went wrong while creating user");
  }

  try {
    await sendEmail({
      email: createdUser.email,
      emailType: "VERIFY",
      userId: createdUser._id,
    });
  } catch (error) {
    throw new ApiError(401, "failed to send verification email", error);
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "user created",
        "user registerd sucessfully,please verify your email",
        createdUser
      )
    );
});
//login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email Or Password Field Missing");
  }
  const user = await User.findOne({
    $or: [{ email }],
  });
  if (!user) {
    throw new ApiError(401, "invalid credintials no user found");
  }
  const isPasswordValid = await isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid credintials password incorrect");
  }
  const { accessToken, refreshToken } = await generateAcessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
  };
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, loggedInUser, "User logged in successfully", {
        accessToken,
        refreshToken,
      })
    );
});
//verifyemail
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpiry: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError(401, "invalid token");
  }
  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;
  await user.save();
  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Email Verified Successfully"));
});

//logout user
const LogoutUser = asyncHandler(async (req, res) => {});
//reset password mail

export { registerUser, loginUser, verifyEmail };
