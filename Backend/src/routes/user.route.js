import { Router } from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resetPasswordMail,
  resetPassword,
  refreshAccessToken,
  LogoutUser
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),

  asyncHandler(registerUser)
);
router.route("/verifyemail").post(asyncHandler(verifyEmail));
router.route("/login").post(asyncHandler(loginUser));
router.route("/resetpasswordmail").post(asyncHandler(resetPasswordMail));
router.route("/resetpassword").post(asyncHandler(resetPassword));
router.route("/refreshtoken").post(asyncHandler(refreshAccessToken));
router.route("/logout").get(verifyJWT,asyncHandler(LogoutUser))


export default router;
