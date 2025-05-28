// app/api/blog/savedblogs/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user/user";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      { error: "Valid User ID is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const user = await UserModel.findById(userId).populate("savedPosts");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.savedPosts, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching saved posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved posts", details: error.message },
      { status: 500 }
    );
  }
}
