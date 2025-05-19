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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const id = params.id;
    const body = await request.json();

    const updatedBlog = await BlogModel.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const id = params.id;
    const deletedBlog = await BlogModel.findByIdAndDelete(id);

    if (!deletedBlog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
