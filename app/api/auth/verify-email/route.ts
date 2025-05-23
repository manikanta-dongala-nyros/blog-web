import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user/user";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Verification token is missing" }, { status: 400 });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }, // Check if token is not expired
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    user.verificationTokenExpires = undefined; // Clear the expiration
    await user.save();

    // Optionally, redirect to a success page or login page
    // For API, returning JSON is standard
    return NextResponse.json({ success: true, message: "Email verified successfully. You can now log in." });

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        error: "Email verification failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}