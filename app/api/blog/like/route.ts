// import { NextRequest, NextResponse } from "next/server";
// import BlogModel from "@/models/blogs/blog";
// import { dbConnect } from "@/lib/dbConnect";

// interface LikeRequestBody {
//   postId: string;
//   userId: string;
// }

// export async function POST(req: NextRequest) {
//   await dbConnect();

//   try {
//     const { postId, userId } = (await req.json()) as LikeRequestBody;

//     if (!postId || typeof postId !== "string") {
//       return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
//     }

//     if (!userId || typeof userId !== "string") {
//       return NextResponse.json(
//         { message: "User ID is required" },
//         { status: 400 }
//       );
//     }

//     const post = await BlogModel.findById(postId);
//     if (!post) {
//       return NextResponse.json({ message: "Post not found" }, { status: 404 });
//     }

//     // Ensure post.likes is an object and post.likes.likedBy is an array
//     if (
//       !post.likes ||
//       typeof post.likes !== "object" ||
//       Array.isArray(post.likes) ||
//       !Array.isArray(post.likes.likedBy)
//     ) {
//       // If post.likes is missing, not an object, or likedBy is not an array, reinitialize the structure
//       post.likes = { likesCount: 0, likedBy: [] };
//     } else {
//       // Ensure likesCount is a number if likes object exists and is valid
//       if (typeof post.likes.likesCount !== "number") {
//         post.likes.likesCount = 0;
//       }
//     }

//     // Now it should be safe to access post.likes.likedBy and call includes
//     if (post.likes.likedBy.includes(userId)) {
//       return NextResponse.json({
//         message: "Already liked",
//         likesCount: post.likes.likesCount,
//         likedBy: post.likes.likedBy,
//       });
//     }

//     // Add userId to likedBy and increment count
//     post.likes.likedBy.push(userId);
//     post.likes.likesCount = post.likes.likedBy.length;

//     await post.save();

//     return NextResponse.json({
//       message: "Post liked successfully",
//       likesCount: post.likes.likesCount,
//       likedBy: post.likes.likedBy,
//     });
//   } catch (error) {
//     console.error("Error liking post:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // delete the like
// export async function DELETE(req: NextRequest) {
//   await dbConnect();

//   try {
//     const { postId, userId } = (await req.json()) as LikeRequestBody;

//     if (!postId || typeof postId !== "string") {
//       return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
//     }

//     if (!userId || typeof userId !== "string") {
//       return NextResponse.json(
//         { message: "User ID is required" },
//         { status: 400 }
//       );
//     }

//     const post = await BlogModel.findById(postId);
//     if (!post) {
//       return NextResponse.json({ message: "Post not found" }, { status: 404 });
//     }
//     // Ensure post.likes is an object and post.likes.likedBy is an array
//     if (
//       !post.likes ||
//       typeof post.likes !== "object" ||
//       Array.isArray(post.likes) ||
//       !Array.isArray(post.likes.likedBy)
//     ) {
//       // If post.likes is missing, not an object, or likedBy is not an array, reinitialize the structure
//       post.likes = { likesCount: 0, likedBy: [] };
//     } else {
//       // Ensure likesCount is a number if likes object exists and is valid
//       if (typeof post.likes.likesCount !== "number") {
//         post.likes.likesCount = 0;
//       }
//     }

//     // Now it should be safe to access post.likes.likedBy and call includes
//     if (!post.likes.likedBy.includes(userId)) {
//       return NextResponse.json({
//         message: "Not liked",
//         likesCount: post.likes.likesCount,
//         likedBy: post.likes.likedBy,
//       });
//     }
//     // Remove userId from likedBy and decrement count
//     post.likes.likedBy = post.likes.likedBy.filter((id) => id !== userId);
//     post.likes.likesCount = post.likes.likedBy.length;

//     await post.save();

//     return NextResponse.json({
//       message: "Post unliked successfully",
//       likesCount: post.likes.likesCount,
//     });
//   } catch (error) {
//     console.error("Error unliking post:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import BlogModel from "@/models/blogs/blog";
import { dbConnect } from "@/lib/dbConnect";

interface LikeRequestBody {
  postId: string;
  userId: string;
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { postId, userId } = (await req.json()) as LikeRequestBody;

    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const post = await BlogModel.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Initialize likes structure if missing or invalid
    if (
      !post.likes ||
      typeof post.likes !== "object" ||
      !Array.isArray(post.likes.likedBy)
    ) {
      post.likes = { likesCount: 0, likedBy: [] };
    }

    const likedBySet = new Set(post.likes.likedBy);
    let message = "";

    if (likedBySet.has(userId)) {
      // User already liked — remove like
      likedBySet.delete(userId);
      message = "Post unliked";
    } else {
      // User has not liked — add like
      likedBySet.add(userId);
      message = "Post liked";
    }

    // Update post likes
    post.likes.likedBy = Array.from(likedBySet);
    post.likes.likesCount = post.likes.likedBy.length;
    await post.save();

    return NextResponse.json({
      message,
      likesCount: post.likes.likesCount,
      likedBy: post.likes.likedBy,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
