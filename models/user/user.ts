import mongoose, { Schema, Document } from "mongoose";

// Define the user interface
export interface IUser extends Document {
  username: string; // We can decide if username is still needed or derived from email/name
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  createdAt: Date;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
}

// Define the user schema
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true }, // Consider if this should be email or if username is separate
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Password will be required
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
});

// Create or get the User model
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
