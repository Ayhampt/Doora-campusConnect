import {
  createProfile,
  getProfile,
  createPortfolio,
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
} from "../controllers/profile.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import express from "express";
const router = express.Router();
router.route("/create").post(verifyJWT,createProfile);
router.route("/createportfolio").post(verifyJWT,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  asyncHandler(createPortfolio)
);

router.route("/portfolio/:userId").get(asyncHandler(getPortfolio));
router.route("/updateportfolio").put(asyncHandler(verifyJWT,updatePortfolio));
router.route("/profile/:userId").get(asyncHandler(getProfile));
router.route("/updateportfolioimage").put(verifyJWT,
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  asyncHandler(updatePortfolioImage)
);
router.route("/deleteportfolio").delete(asyncHandler(verifyJWT,deletePortfolio));
router.route("/createsociallinks").post(asyncHandler(verifyJWT,createSocialLinks));
router.route("/social/:userId").get(asyncHandler(getSocialLinks));
router.route("/updatesociallinks").put(asyncHandler(verifyJWT,updateSocialLinks));
router.route("/deletesociallinks").delete(asyncHandler(verifyJWT,deleteSocialLinks));
router.route("/getalllaunches").get(asyncHandler(verifyJWT,getAllLaunches));
router.route("/geteventshosted").get(asyncHandler(verifyJWT,getEventsHosted));
router.route("/eventsattended").get(asyncHandler(verifyJWT,eventsAttended));

export default router;
