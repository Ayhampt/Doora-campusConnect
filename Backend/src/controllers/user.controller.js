import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import fs from "fs";
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
  const { firstname, lastname, email, password, phone, } = req.body;
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
  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("uploaded avatar", avatar);
  } catch (error) {
    console.log("error uploading avatar", error);
    throw new ApiError(500, "failed to upload avatar");
  }

  try {
    const user = await User.create({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password,
      phone: phone,
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
  } catch (error) {
    console.log("error creating user", error);
    if(avatar){
      await deleteOnCloudinary(avatar.public_id);
    }

    throw new ApiError(500, "somthing went wrong while creating user and avatar delete from Cloudinary");
  }
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
  console.log("token :",req.body);
  
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

//reset password mail send
const resetPasswordMail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new ApiError(401, "invalid credintials no user found");
  }
  try {
    await sendEmail({
      email: user.email,
      emailType: "RESET",
      userId: user._id,
    });
  } catch (error) {
    throw new ApiError(401, "failed to send verification email", error);
  }
  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Reset Password Email Sent Successfully"));
});
//resetpassword
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError(401, "invalid token");
  }
  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save();
  return res
    .status(201)
    .json(new ApiResponse(200, {}, "Password Reset Successfully"));
});

//logout user
const LogoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user,
    {
      $set: {
        refreshToken: "undefined",
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
  };
  return res
    .status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
//refreshAccessToken
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, newRefreshToken } = await generateAcessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});


export {
  registerUser,
  loginUser,
  verifyEmail,
  LogoutUser,
  resetPasswordMail,
  resetPassword,
  refreshAccessToken,
};
