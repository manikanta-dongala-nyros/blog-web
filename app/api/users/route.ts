import { NextResponse } from "next/server";
import User from "@/models/user/user";

export async function GET() {
  try {
    // Fetch all users from the database
    const users = await User.find({});

    // Return successful response with users data
    return NextResponse.json(
      {
        users,
        message: "Users fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    // Return error response
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
