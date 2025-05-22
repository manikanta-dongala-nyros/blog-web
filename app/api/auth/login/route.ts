import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user/user";

export async function POST(request: Request) {
  try {
    // console.log("Attempting to connect to MongoDB...");
    await dbConnect();
    // console.log("Successfully connected to MongoDB");

    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required as a string" },
        { status: 400 }
      );
    }

    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Email not found in the database" },
        { status: 404 }
      );
    }

    console.log("User  found:", { username: user.username, email: user.email }); // Log only the email for security

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Detailed login error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
