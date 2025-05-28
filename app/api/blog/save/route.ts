import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import BlogModel from "@/models/blogs/blog";
import UserModel from "@/models/user/user";
import mongoose from "mongoose";

interface SaveRequestBody {
  userId: string;
  postId: string;
}

// POST: Save a blog post
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, postId }: SaveRequestBody = await request.json();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Valid User ID is required" },
        { status: 400 }
      );
    }

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Valid Post ID is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await BlogModel.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if post is already saved
    const isAlreadySaved = user.savedPosts.some((id: mongoose.Types.ObjectId) =>
      id.equals(postId)
    );
    if (isAlreadySaved) {
      return NextResponse.json(
        { message: "Post already saved" },
        { status: 200 }
      );
    }

    // Add postId to savedPosts using $addToSet to avoid duplicates
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { savedPosts: postId },
    });

    return NextResponse.json(
      { message: "Post saved successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving post:", error);
    return NextResponse.json(
      { error: "Failed to save post", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Unsave a blog post
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, postId }: SaveRequestBody = await request.json();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Valid User ID is required" },
        { status: 400 }
      );
    }

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Valid Post ID is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove postId from savedPosts
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { savedPosts: postId },
    });

    return NextResponse.json(
      { message: "Post unsaved successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error unsaving post:", error);
    return NextResponse.json(
      { error: "Failed to unsave post", details: error.message },
      { status: 500 }
    );
  }
}
