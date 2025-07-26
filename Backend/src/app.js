import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//import route
import healthCheckRouter from "./routes/healthCheck.route.js";
import userRouter from "./routes/user.route.js"
import { errorHandler } from "./middleware/error.middleware.js";


//use route
app.use("/api/v1/healthcheck",healthCheckRouter);
app.use("/api/v1/user", userRouter);
app.use(errorHandler)

export { app };
