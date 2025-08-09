import { Event } from "../models/events.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

// Create a new event
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    location,
    date,
    category,
    capacity,
    bookLink,
  } = req.body;
  const userId = req.user?._id;

  if (!title || !description || !location || !date) {
    throw new ApiError(
      400,
      "Title, description, location, and date are required"
    );
  }

  // Validate date is in the future
  const eventDate = new Date(date);
  if (eventDate <= new Date()) {
    throw new ApiError(400, "Event date must be in the future");
  }

  let imageUrl;
  // Handle image upload if provided
  if (req.files?.image?.[0]) {
    const imageLocalPath = req.files.image[0].path;
    const image = await uploadOnCloudinary(imageLocalPath);
    if (image) {
      imageUrl = image.url;
    }
  }

  // Create the event
  const event = await Event.create({
    title,
    description,
    host: userId,
    location,
    date: eventDate,
    category: category || "other",
    capacity: capacity || 0,
    bookLink,
    image: imageUrl,
    attendees: [],
  });

  if (!event) {
    throw new ApiError(500, "Failed to create event");
  }

  // Populate host details
  const populatedEvent = await Event.findById(event._id).populate(
    "host",
    "firstname lastname email avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedEvent, "Event created successfully"));
});

// Get all events with filtering and pagination
const getAllEvents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status = "upcoming",
    category,
    search,
    upcoming,
  } = req.query;

  const matchStage = {};

  // Filter by status
  if (status && status !== "all") {
    matchStage.status = status;
  }

  // Filter by category if provided
  if (category && category !== "all") {
    matchStage.category = category;
  }

  // Search by title if provided
  if (search) {
    matchStage.title = { $regex: search, $options: "i" };
  }

  // Filter upcoming events (date >= today)
  if (upcoming === "true") {
    matchStage.date = { $gte: new Date() };
    matchStage.status = { $in: ["upcoming", "ongoing"] };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "host",
        foreignField: "_id",
        as: "host",
        pipeline: [
          {
            $project: {
              firstname: 1,
              lastname: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "attendees",
        foreignField: "_id",
        as: "attendees",
        pipeline: [
          {
            $project: {
              firstname: 1,
              lastname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$host",
    },
    {
      $addFields: {
        attendeesCount: { $size: "$attendees" },
        isCapacityFull:
          capacity > 0 ? { $gte: [{ $size: "$attendees" }, "$capacity"] } : false,
      },
    },
    {
      $sort: { date: 1 }, // Sort by date ascending (earliest first)
    },
  ];

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const events = await Event.aggregatePaginate(
    Event.aggregate(pipeline),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Events retrieved successfully"));
});

// Get event by ID
const getEventById = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "Invalid event ID");
  }

  const event = await Event.findById(eventId)
    .populate("host", "firstname lastname email avatar")
    .populate("attendees", "firstname lastname avatar");

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Add computed fields
  const eventData = event.toObject();
  eventData.attendeesCount = event.attendees.length;
  eventData.isCapacityFull =
    event.capacity > 0 && event.attendees.length >= event.capacity;

  return res
    .status(200)
    .json(new ApiResponse(200, eventData, "Event retrieved successfully"));
});

// Update event (only host can update)
const updateEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const {
    title,
    description,
    location,
    date,
    category,
    capacity,
    status,
    bookLink,
  } = req.body;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "Invalid event ID");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Check if user is the host
  if (event.host.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own events");
  }

  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (location) updateData.location = location;
  if (date) {
    const eventDate = new Date(date);
    if (eventDate <= new Date() && status !== "completed") {
      throw new ApiError(400, "Event date must be in the future");
    }
    updateData.date = eventDate;
  }
  if (category) updateData.category = category;
  if (capacity !== undefined) updateData.capacity = capacity;
  if (status) updateData.status = status;
  if (bookLink !== undefined) updateData.bookLink = bookLink;

  // Handle image update if provided
  if (req.files?.image?.[0]) {
    const imageLocalPath = req.files.image[0].path;
    const image = await uploadOnCloudinary(imageLocalPath);
    if (image) {
      updateData.image = image.url;
    }
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $set: updateData },
    { new: true }
  )
    .populate("host", "firstname lastname email avatar")
    .populate("attendees", "firstname lastname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
});

// Delete event (only host can delete)
const deleteEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "Invalid event ID");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Check if user is the host
  if (event.host.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own events");
  }

  await Event.findByIdAndDelete(eventId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Event deleted successfully"));
});

// Join/Register for an event
const joinEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "Invalid event ID");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Check if event is still upcoming
  if (event.status !== "upcoming") {
    throw new ApiError(400, "Cannot join a completed or cancelled event");
  }

  // Check if event date has passed
  if (event.date <= new Date()) {
    throw new ApiError(400, "Cannot join a past event");
  }

  // Check if user is already attending
  if (event.attendees.includes(userId)) {
    throw new ApiError(400, "You are already registered for this event");
  }

  // Check capacity
  if (event.capacity > 0 && event.attendees.length >= event.capacity) {
    throw new ApiError(400, "Event is at full capacity");
  }

  // Add user to attendees
  event.attendees.push(userId);
  await event.save();

  const updatedEvent = await Event.findById(eventId)
    .populate("host", "firstname lastname email avatar")
    .populate("attendees", "firstname lastname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Successfully joined the event"));
});

// Leave an event
const leaveEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "Invalid event ID");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Check if user is attending
  if (!event.attendees.includes(userId)) {
    throw new ApiError(400, "You are not registered for this event");
  }

  // Remove user from attendees
  event.attendees = event.attendees.filter(
    (attendeeId) => attendeeId.toString() !== userId.toString()
  );
  await event.save();

  const updatedEvent = await Event.findById(eventId)
    .populate("host", "firstname lastname email avatar")
    .populate("attendees", "firstname lastname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Successfully left the event"));
});
//get all users Attending event
const usersAttendingEvent = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const eventId = req.params.eventId;
  if(!userId){
    throw new ApiError(401, "Unauthorized");
  }
  const event = await Event.findById(eventId)
  if(!event){
    throw new ApiError(404, "Event not found");
  }
  const users = await User.find({ _id: { $in: event.attendees } },
    "firstname lastname email phone"
  );
  return res.status(200).json(new ApiResponse(200, users, "Users attending the event"));


})

export {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  usersAttendingEvent,
};
