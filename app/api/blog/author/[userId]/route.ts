import { NextRequest, NextResponse } from "next/server";
import BlogModel from "@/models/blogs/blog";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await dbConnect();
    const { userId } = params;
    console.log("userId on get blog route.ts", userId); // Add this line for debugging

    if (!userId) {
      return NextResponse.json(
        { error: "Author ID is required" },
        { status: 400 }
      );
    }

    const posts = await BlogModel.find({ userId: userId });

    return NextResponse.json(posts);
  } catch (error: unknown) {
    console.error("Error fetching author's blog posts:", error);

    let errorMessage = "Failed to fetch author's blog posts.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
