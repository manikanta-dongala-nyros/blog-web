import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

// Get the Blog model
const BlogModel =
  mongoose.models.Blog ||
  mongoose.model(
    "Blog",
    new mongoose.Schema({
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      content: { type: String, required: true },
      author: { type: String, required: true },
      tags: [{ type: String }],
      published: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    })
  );

export async function PUT(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    const updatedBlog = await BlogModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBlog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}
