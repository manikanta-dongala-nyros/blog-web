// pages/api/blogs/upload.ts (your API route)
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getGFS } from "../[id]/route";
import BlogModel, { IBlog } from "@/models/blogs/blog";
import mongoose from "mongoose";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    await clientPromise;

    const formData = await request.formData();
    const data: { [key: string]: any } = {};
    let file: File | null = null;

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) file = value;
      else data[key] = value;
    }

    const newPostData: Partial<IBlog> = {
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-"),
      content: data.content,
      author: data.author,
      tags: data.tags
        ? data.tags.split(",").map((tag: string) => tag.trim())
        : [],
      published: data.published === "true" || data.published === true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (file) {
      const gfs = await getGFS();
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadStream = gfs.openUploadStream(file.name, {
        contentType: file.type,
      });

      uploadStream.write(buffer);
      uploadStream.end();

      await new Promise<void>((resolve, reject) => {
        uploadStream.on("finish", () => {
          newPostData.imageId = uploadStream.id as mongoose.Types.ObjectId;
          newPostData.imageMimeType = file.type;
          resolve();
        });
        uploadStream.on("error", (err: unknown) => {
          reject(err);
        });
      });
    }

    const blogPost = new BlogModel(newPostData);
    await blogPost.save();

    return NextResponse.json(
      {
        ...blogPost.toObject(),
        id: (blogPost._id as mongoose.Types.ObjectId).toString(),
        imageId: blogPost.imageId ? blogPost.imageId.toString() : undefined,
        _id: undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create blog post", details: error.message },
      { status: 500 }
    );
  }
}
