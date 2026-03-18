const mongoose = require("mongoose");

async function connectDB() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) throw new Error("mongo URI not found in environmental variables");
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
module.exports = connectDB;
