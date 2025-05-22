import { NextRequest, NextResponse } from "next/server";
import BlogModel from "@/models/blogs/blog";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const posts = await BlogModel.find({}).sort({ createdAt: -1 }).lean();

    // // Map _id to id for frontend consistency and remove _id
    // const processedPosts = posts.map(({ _id, ...rest }) => ({
    //   ...rest,
    //   id: _id.toString(),
    // }));

    return NextResponse.json(posts);
  } catch (error: unknown) {
    console.error("Error fetching blog posts:", error);

    let errorMessage = "Failed to fetch blog posts.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
