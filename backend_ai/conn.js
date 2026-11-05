const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then((res) => {
    console.log("database connected successfully!");
  })
  .catch((err) => {
    console.log("something error,", err);
  });