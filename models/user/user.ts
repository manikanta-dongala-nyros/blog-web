import mongoose, { Schema } from "mongoose";

// Define the user schema
const userSchema = new Schema({
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create or get the User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
