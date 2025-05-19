import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose, { Schema } from "mongoose";

// Define the user schema
const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create or get the User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

export async function POST(request: Request) {
  try {
    console.log("Attempting to connect to MongoDB...");
    await dbConnect();
    console.log("Successfully connected to MongoDB");

    const body = await request.json();
    const { username, email } = body;

    if (!username || !email) {
      return NextResponse.json(
        { error: "Username and email are required" },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({ username, email });
    await user.save();
    console.log("User registered successfully:", user);

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("Detailed registration error:", error);
    return NextResponse.json(
      {
        error: "Registration failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
