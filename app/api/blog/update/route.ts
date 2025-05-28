/* ===============================
 * 📁 app/api/blog/update/route.ts
 * =============================== */

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import BlogModel, { IBlog } from "@/models/blogs/blog";
import mongoose from "mongoose";
import { getGFS } from "../[id]/route";

export async function PUT(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data." },
        { status: 400 }
      );
    }

    await dbConnect();
    const gfs = await getGFS();
    const formData = await request.formData();
    const data: { [key: string]: any } = {};
    let file: File | null = null;
    let blogId: string | null = null;

    for (const [key, value] of formData.entries()) {
      if (key === "id") blogId = value as string;
      else if (value instanceof File) file = value;
      else data[key] = value;
    }

    if (!blogId) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    const existingBlog = await BlogModel.findById(blogId);
    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Inside the PUT function
    const updateData: Partial<IBlog> = { ...data };
    updateData.updatedAt = new Date();

    if (data.tags && typeof data.tags === "string") {
      updateData.tags = data.tags.split(",").map((tag: string) => tag.trim());
    }
    if (data.published !== undefined) {
      updateData.published =
        data.published === "true" || data.published === true;
    }

    // Handle likes data if provided
    if (data.likes && typeof data.likes === "string") {
      try {
        updateData.likes = JSON.parse(data.likes);
      } catch (e) {
        console.error("Error parsing likes data:", e);
        // If parsing fails, preserve existing likes
        updateData.likes = existingBlog.likes;
      }
    } else {
      // If likes data is not provided, preserve existing likes
      updateData.likes = existingBlog.likes;
    }

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit" },
          { status: 400 }
        );
      }

      let uploadSuccess = false;
      try {
        if (existingBlog.imageId) {
          await gfs.delete(new mongoose.Types.ObjectId(existingBlog.imageId));
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadStream = gfs.openUploadStream(file.name, {
          contentType: file.type,
        });
        uploadStream.end(buffer);

        await new Promise<void>((resolve, reject) => {
          uploadStream.on("finish", () => {
            uploadSuccess = true;
            updateData.imageId = uploadStream.id as mongoose.Types.ObjectId;
            updateData.imageMimeType = file!.type;
            resolve();
          });
          uploadStream.on("error", reject);
        });
      } catch (err) {
        if (!uploadSuccess && updateData.imageId) {
          await gfs.delete(updateData.imageId);
        }
        throw err;
      }
    } else if (data.removeImage === "true" || data.removeImage === true) {
      if (existingBlog.imageId) {
        try {
          await gfs.delete(new mongoose.Types.ObjectId(existingBlog.imageId));
        } catch (e) {
          console.warn("Failed to delete image:", e);
        }
      }
      updateData.imageId = undefined;
      updateData.imageMimeType = undefined;
    }

    const updatedBlog = await BlogModel.findByIdAndUpdate(
      blogId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedBlog);
  } catch (err: any) {
    console.error("Update Error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
