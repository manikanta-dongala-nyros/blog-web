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

export async function GET() {
  try {
    await dbConnect();

    const blogs = await BlogModel.find({});
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
