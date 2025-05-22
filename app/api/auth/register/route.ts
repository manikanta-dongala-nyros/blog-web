import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect"; // Use consistent connection utility
import User from "@/models/user/user"; // Use your central User model

export async function POST(request: Request) {
  try {
    // console.log("Connecting to MongoDB...");
    await dbConnect(); // Consistent DB connection
    // console.log("Connected to MongoDB");

    const body = await request.json();
    const { username, email } = body;

    if (!username || !email) {
      return NextResponse.json(
        { error: "Username and email are required" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({ username, email });
    await newUser.save();
    console.log("User registered successfully:", newUser);

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Registration failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
