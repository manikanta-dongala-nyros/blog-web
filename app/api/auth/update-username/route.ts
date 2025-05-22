import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user/user"; // Your User model

export async function PUT(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, newUsername } = body;

    if (!userId || !newUsername) {
      return NextResponse.json(
        { error: "User ID and new username are required" },
        { status: 400 }
      );
    }

    if (typeof newUsername !== 'string' || newUsername.trim().length === 0) {
      return NextResponse.json(
        { error: "New username must be a non-empty string" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    user.username = newUsername.trim();
    await user.save();

    // Return the updated user, excluding sensitive data if any
    const updatedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      // Add other fields you want to return to the client
    };

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Update username error:", error);
    return NextResponse.json(
      {
        error: "Failed to update username",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}