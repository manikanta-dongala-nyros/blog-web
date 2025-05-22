import mongoose, { Schema } from "mongoose";

// Define the user schema
const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// Create or get the User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
