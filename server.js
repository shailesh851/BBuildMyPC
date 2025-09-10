const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello from Express on Render!");
});

// connect to MongoDB (optional)
// mongoose.connect(process.env.MONGO_URI)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
