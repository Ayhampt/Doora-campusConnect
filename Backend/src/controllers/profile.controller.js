import { asyncHandler } from "../utils/asyncHandler.js";
import { Profile } from "../models/profile.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
//create profile
const createProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const existingProfile = await Profile.findOne({ user: userId });

  if (existingProfile) {
    throw new ApiError(409, "Profile already exists");
  }

  const { displayName, bio, skills, categories, experienceLevel } = req.body;

  if (!displayName || !bio || !skills || !categories) {
    throw new ApiError(400, "All required fields must be provided");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const newProfile = new Profile({
    user: userId,
    avatar: user.avatar,
    displayName,
    bio,
    skills,
    categories,
    experienceLevel,
  });

  await newProfile.save();

  return res
    .status(201)
    .json(new ApiResponse(201, newProfile, "Profile created successfully"));
});
//get profile
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Profile retrieved successfully"));
})
//create portfolio
const createPortfolio = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  const { title, description, link, image } = req.body;
  if (!title || !description || !link) {
    throw new ApiError(400, "All portfolio fields are required");
  }

  console.warn(req.files);
  const imageLocalPath = req.files?.image?.[0]?.path;

  if (!imageLocalPath) {
    throw new ApiError(400, "upload a image");
  }
  let Portfolioimage;
  try {
    Portfolioimage = await uploadOnCloudinary(imageLocalPath);
    console.log("uploaded avatar", Portfolioimage);
  } catch (error) {
    console.log("error uploading image", error);
    throw new ApiError(500, "failed to upload image");
  }
  const portfolioItem = {
    title,
    description,
    link,
    image: Portfolioimage?.url,
  };
  profile.portfolio.push(portfolioItem);
  await profile.save();

  return res
    .status(201)
    .json(new ApiResponse(201, profile, "Portfolio item added successfully"));
});
//get portfolio
const getPortfolio = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        profile.portfolio,
        "Portfolio retrieved successfully"
      )
    );
});
//update portfolio
const updatePortfolio = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  const { title, description, link } = req.body;
  if (!title || !description || !link ) {
    throw new ApiError(400, "All portfolio fields are required");
  }
  const portfolioItem = profile.portfolio.find(
    (item) => item._id.toString() === req.params.id
  );
  if (!portfolioItem) {
    throw new ApiError(404, "Portfolio item not found");
  }
  portfolioItem.title = title;
  portfolioItem.description = description;
  portfolioItem.link = link;
  await profile.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, portfolioItem, "Portfolio item updated successfully")
    );
});
//update portfolio image
const updatePortfolioImage = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  const portfolioItem = profile.portfolio.find(
    (item) => item._id.toString() === req.params.id
  );
  if (!portfolioItem) {
    throw new ApiError(404, "Portfolio item not found");
  }
  const imageLocalPath = req.files?.image?.[0]?.path;
  if (!imageLocalPath) {
    throw new ApiError(400, "upload a image");
  }
  let Portfolioimage;
  try {
    Portfolioimage = await uploadOnCloudinary(imageLocalPath);
    console.log("uploaded avatar", Portfolioimage);
  } catch (error) {
    console.log("error uploading image", error);
    throw new ApiError(500, "failed to upload image");
  }
  portfolioItem.image = Portfolioimage?.url;
  await profile.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, portfolioItem, "Portfolio item updated successfully")
    );
})
//delete portfolio
const deletePortfolio = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  const portfolioItem = profile.portfolio.find(
    (item) => item._id.toString() === req.params.id
  );
  if (!portfolioItem) {
    throw new ApiError(404, "Portfolio item not found");
  }
  profile.portfolio.pull(portfolioItem);
  await profile.save();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Portfolio item deleted successfully"));
});
//social links
const createSocialLinks = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  if (profile.socialLinks) {
    throw new ApiError(400, "Social links already exist for this profile");
  }
  const { website, github, linkedin, twitter, dribbble } = req.body;
  const socialLinks = {
    website,
    github,
    linkedin,
    twitter,
    dribbble,
  };
  profile.socialLinks = socialLinks;
  await profile.save();
  return res
    .status(201)
    .json(
      new ApiResponse(201, socialLinks, "Social links created successfully")
    );
});
//get social links
const getSocialLinks = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  if (!profile.socialLinks) {
    throw new ApiError(404, "Social links not found for this profile");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        profile.socialLinks,
        "Social links retrieved successfully"
      )
    );
});
//update social links
const updateSocialLinks = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  if (!profile.socialLinks) {
    throw new ApiError(404, "Social links not found for this profile");
  }
  const { website, github, linkedin, twitter, dribbble } = req.body;
  profile.socialLinks.website = website;
  profile.socialLinks.github = github;
  profile.socialLinks.linkedin = linkedin;
  profile.socialLinks.twitter = twitter;
  profile.socialLinks.dribbble = dribbble;
  await profile.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        profile.socialLinks,
        "Social links updated successfully"
      )
    );
});
//delete social links
const deleteSocialLinks = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  if (!profile.socialLinks) {
    throw new ApiError(404, "Social links not found for this profile");
  }
  profile.socialLinks = null;
  await profile.save();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Social links deleted successfully"));
});
//get all launches
const getAllLaunches = asyncHandler(async (req, res) => {
  const userId = await User.findById(req.user?._id);
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const launches = await Profile.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId._id.toString()),
      },
    },
    {
      $lookup: {
        from: "launch",
        let: { userId: "$user" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$owner", "$$userId"] },
            },
          },
          {
            $project: {
              title: 1,
              description: 1,
              category: 1,
              images: 1,
              createdAt: 1,
            },
          },
        ],
        as: "launches",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, launches, "Launches retrieved successfully"));
});
//get all events hosted
const getEventsHosted = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const eventsHosted = await Profile.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId.toString()),
      },
    },
    {
      $lookup: {
        from: "events",
        let: { userId: "$user" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$host", "$$userId"] },
            },
          },
          {
            $project: {
              title: 1,
              description: 1,
              category: 1,
              image: 1,
              date: 1,
              status: 1,
            },
          },
        ],
        as: "eventsHosted",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, eventsHosted, "Events hosted retrieved successfully")
    );
});
//events attended
const eventsAttended = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const eventsAttended = await Profile.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId.toString()),
      },
    },
    {
      $lookup: {
        from: "events",
        let: { userId: "$user" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$attendees", "$$userId"] },
            },
          },
          {
            $project: {
              title: 1,
              description: 1,
              category: 1,
              image: 1,
              date: 1,
              status: 1,
            },
          },
        ],
        as: "eventsAttended",
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        eventsAttended,
        "Events attended retrieved successfully"
      )
    );
});

export {
  createProfile,
  createPortfolio,
  getProfile,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
  createSocialLinks,
  getSocialLinks,
  updateSocialLinks,
  deleteSocialLinks,
  getAllLaunches,
  getEventsHosted,
  eventsAttended,
  updatePortfolioImage,
};
