import mongoose, { Schema, Document, Types } from "mongoose";

// Define the user interface
export interface IUser extends Document {
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  createdAt: Date;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  savedPosts: Types.ObjectId[]; // Array of post IDs
}

// Define the user schema
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },

  // New field for saved posts
  savedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Blog", // Reference to your Blog/Post model
    },
  ],
});

// Create or get the User model
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
