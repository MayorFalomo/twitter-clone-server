const express = require("express");
const app = express();
const dotEnv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");

dotEnv.config({ path: "./vars/.env" });
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected To MongoDB"))
  .catch((err) => {
    console.log(err);
  });

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen("7000", () => {
  console.log("Server is running on port 7000");
  console.log(process.env.MONGO_URL);
});
