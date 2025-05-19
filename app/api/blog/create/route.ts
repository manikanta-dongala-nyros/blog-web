import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose, { Schema } from "mongoose";

// Define the blog schema
const blogSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create or get the Blog model
const BlogModel = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export async function POST(request: Request) {
  try {
    console.log("Attempting to connect to MongoDB...");
    await dbConnect();
    console.log("Successfully connected to MongoDB");

    const body = await request.json();
    console.log("Received body:", body);

    const blog = new BlogModel(body);
    console.log("Created blog model instance");

    await blog.save();
    console.log("Successfully saved blog to database");

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Failed to create blog post",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
