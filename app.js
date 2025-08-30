import express from "express";
import dotenv from "dotenv";
import routes from "./routes/routes.js";
import { connectDB } from "./config/db.js"
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Express");
});

connectDB();

app.use("/", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
