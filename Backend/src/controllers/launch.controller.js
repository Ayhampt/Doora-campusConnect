import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {Launch} from "../models/launch.model.js"
import mongoose from "mongoose";

// Create a new project launch
const createLaunch = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const userId = req.user?._id;

  if (!title || !description || !category) {
    throw new ApiError(400, "Title, description, and category are required");
  }

  if (!req.files?.images?.[0]) {
    throw new ApiError(400, "Project image is required");
  }

  // Upload image to cloudinary
  const imageLocalPath = req.files?.images?.[0]?.path;
  if(!imageLocalPath){
    throw new ApiError(400, "Project image is required");
  }
  const image = await uploadOnCloudinary(imageLocalPath);

  if (!image) {
    throw new ApiError(500, "Failed to upload image");
  }

  // Create the launch
  const launch = await Launch.create({
    title,
    description,
    owner: userId,
    category: category.toLowerCase(),
    images: image?.url,
  });

  if (!launch) {
    throw new ApiError(500, "Failed to create launch");
  }

  // Populate owner details
  const populatedLaunch = await Launch.findById(launch._id)
    .populate("owner", "firstname lastname email avatar");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedLaunch, "Launch created successfully"));
});

// Get all launches with pagination
const getAllLaunches = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;

    const filter = {};
    if (category && category !== "all") {
      filter.category = category.toLowerCase(); 
    }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    select: "title description category images createdAt",
  };

  const launches = await Launch.paginate({}, options);

  return res
    .status(200)
    .json(
      new ApiResponse(200, launches, "All launches retrieved successfully")
    );
});

// Get launch by ID
const getLaunchById = asyncHandler(async (req, res) => {
  const { launchId } = req.params;

  if (!mongoose.isValidObjectId(launchId)) {
    throw new ApiError(400, "Invalid launch ID");
  }

  const launch = await Launch.findById(launchId)
    .populate("owner", "firstname lastname email avatar")
    .populate("category", "name description");

  if (!launch) {
    throw new ApiError(404, "Launch not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, launch, "Launch retrieved successfully"));
});

// Update launch (only owner can update)
const updateLaunch = asyncHandler(async (req, res) => {
  const { launchId } = req.params;
  const { title, description, category } = req.body;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(launchId)) {
    throw new ApiError(400, "Invalid launch ID");
  }

  const launch = await Launch.findById(launchId);
  if (!launch) {
    throw new ApiError(404, "Launch not found");
  }

  // Check if user is the owner
  if (launch.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own launches");
  }

  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (category) updateData.category = category.toLowerCase();
    

  // Handle image update if provided
  if (req.files?.images?.[0]) {
    const imageLocalPath = req.files.images[0].path;
    const image = await uploadOnCloudinary(imageLocalPath);
    if (image) {
      updateData.images = image.url;
    }
  }

  const updatedLaunch = await Launch.findByIdAndUpdate(
    launchId,
    { $set: updateData },
    { new: true }
  )
    .populate("owner", "firstname lastname email avatar")
    .populate("category", "name description");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedLaunch, "Launch updated successfully"));
});

// Delete launch (only owner can delete)
const deleteLaunch = asyncHandler(async (req, res) => {
  const { launchId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(launchId)) {
    throw new ApiError(400, "Invalid launch ID");
  }

  const launch = await Launch.findById(launchId);
  if (!launch) {
    throw new ApiError(404, "Launch not found");
  }

  // Check if user is the owner
  if (launch.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own launches");
  }

  await Launch.findByIdAndDelete(launchId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Launch deleted successfully"));
});


export {
  createLaunch,
  getAllLaunches,
  getLaunchById,
  updateLaunch,
  deleteLaunch,
};
