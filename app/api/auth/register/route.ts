import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user/user";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { firstName, lastName, username, email, password, confirmPassword } =
      body;

    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          error:
            "All fields (First Name, Last Name, Username, Email, Password, Confirm Password) are required",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Basic password strength (example: min 8 chars)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "User with this username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
      isVerified: false, // User is not verified initially
    });

    await newUser.save();

    // Send verification email
    try {
      await sendVerificationEmail(
        email,
        verificationToken,
        request.headers.get("host") || "localhost:3000"
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Optionally, you could decide if registration should fail if email sending fails.
      // For now, we'll proceed but log the error.
      // You might want to return a specific error or message to the user.
    }

    console.log(
      "User registered, verification email initiated:",
      newUser.email
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration successful. Please check your email to verify your account.",
        // Do not return the full user object or token here for security.
      },
      { status: 201 }
    );
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
