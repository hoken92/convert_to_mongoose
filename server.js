import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

const PORT = process.env.PORT || 3000;
const app = express();

await mongoose.connect(process.env.ATLAS_URI);
console.log("Connected to Mongo!");

import grades from "./routes/grades.js";
import grades_agg from "./routes/grades_agg.js";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API.");
});

app.use("/grades", grades);
app.use("/grades", grades_agg);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Seems like we messed up somewhere...");
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
