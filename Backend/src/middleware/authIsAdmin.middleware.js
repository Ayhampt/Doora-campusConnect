import { ApiError } from "../utils/ApiError";

export const isAdmin = (req,_, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Access denied. Admins only.");
  }
  next();
};
