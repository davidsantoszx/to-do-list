
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/tasks.routes";
import listRoutes from "./routes/lists.routes";
import tagRoutes from "./routes/tags.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use("/api/lists", listRoutes);
app.use("/api/tags", tagRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "TodoList API funcionando",
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
