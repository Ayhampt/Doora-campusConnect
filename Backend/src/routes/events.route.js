import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  usersAttendingEvent
} from "../controllers/events.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Public routes
router.route("/").get(asyncHandler(getAllEvents));
router.route("/:eventId").get(asyncHandler(getEventById));

// Protected routes (require authentication)
router.use(verifyJWT);

router.route("/create").post(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  asyncHandler(createEvent)
);



router.route("/update/:eventId").patch(upload.fields([
  {
    name: "image",
    maxCount: 1,
  },
]), asyncHandler(updateEvent));
router.route("delete/:eventId").delete(asyncHandler(deleteEvent));
router.route("/:eventId/join").post(asyncHandler(joinEvent));
router.route("/:eventId/leave").post(asyncHandler(leaveEvent));
router.route("/:eventId/users").get(asyncHandler(usersAttendingEvent));

export default router;
