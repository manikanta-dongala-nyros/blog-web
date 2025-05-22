import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error('Missing environment variable: "MONGODB_URI"');
}

export async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to Mongoose");
  } catch (err) {
    console.error("Mongoose connection failed:", err);
    throw err;
  }
}
