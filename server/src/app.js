import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import accountRoutes from "./routes/account.routes.js";
import transferRoutes from "./routes/transfer.routes.js";
import serviceBillRoutes from "./routes/serviceBill.routes.js";
import userRoutes from "./routes/user.routes.js";  // Añadido
import recoveryRoutes from "./routes/recovery.routes.js";  // Añadido
import { FRONTEND_URL } from "./config.js";

const app = express();


app.use(
  cors({
    credentials: true,
    origin: FRONTEND_URL,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", accountRoutes);
app.use("/api", transferRoutes);
app.use("/api", serviceBillRoutes);
app.use("/api", userRoutes);  // Añadido
app.use("/api", recoveryRoutes);  // Añadido

if (process.env.NODE_ENV === "production") {
  const path = await import("path");
  app.use(express.static("client/dist"));

  app.get("*", (req, res) => {
    console.log(path.resolve("client", "dist", "index.html"));
    res.sendFile(path.resolve("client", "dist", "index.html"));
  });
}

export default app;
