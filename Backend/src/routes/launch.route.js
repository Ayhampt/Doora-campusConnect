import { Router } from "express";
import {
  createLaunch,
  getAllLaunches,
  getLaunchById,
  updateLaunch,
  deleteLaunch,
} from "../controllers/launch.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Public routes
router.route("/").get(asyncHandler(getAllLaunches));
router.route("/:launchId").get(asyncHandler(getLaunchById));

// Protected routes (require authentication)
router.use(verifyJWT); // Apply to all routes below

router
  .route("/create")
  .post(
    upload.fields([{ name: "images", maxCount: 1 }]),
    asyncHandler(createLaunch)
  );

router
  .route("/update/:launchId")
  .patch(
    upload.single("images"),
    asyncHandler(updateLaunch)
  );

router.route("/delete/:launchId").delete(asyncHandler(deleteLaunch));
  
  

export default router;
