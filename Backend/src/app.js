import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

//import route
import healthCheckRoute from "./routes/healthCheck.route.js";

//use route
app.use("/api/healthCheck/v1", healthCheckRoute);

export { app };
