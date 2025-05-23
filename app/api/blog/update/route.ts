// import { NextRequest, NextResponse } from "next/server";
// import { dbConnect } from "@/lib/dbConnect";
// import { saveToGridFS } from "@/lib/gridfs"; // Keep saveToGridFS if needed elsewhere
// import BlogModel, { IBlog } from "@/models/blogs/blog";
// import mongoose from "mongoose";
// import { getGFS } from "../[id]/route";

// export async function PUT(request: NextRequest) {
//   try {
//     await dbConnect(); // Added await here
//     // Get the GridFS bucket instance using the correct function from gridfs.ts
//     const gfs = await getGFS(); // Use getGFS instead of getGridFSBucket

//     const formData = await request.formData(); // Error happens here if Content-Type is wrong
//     const data: { [key: string]: any } = {};
//     let file: File | null = null;
//     let blogId: string | null = null;

//     for (const [key, value] of formData.entries()) {
//       if (key === "id") {
//         // Assuming 'id' is passed in form data for the blog post
//         blogId = value as string;
//       } else if (value instanceof File) {
//         file = value;
//       } else {
//         data[key] = value;
//       }
//     }

//     if (!blogId) {
//       return NextResponse.json(
//         { error: "Blog ID is required" },
//         { status: 400 }
//       );
//     }

//     const existingBlog = await BlogModel.findById(blogId);
//     if (!existingBlog) {
//       return NextResponse.json(
//         { error: "Blog post not found" },
//         { status: 404 }
//       );
//     }

//     const updateData: Partial<IBlog> = { ...data }; // Spread other form fields
//     updateData.updatedAt = new Date();
//     if (data.tags && typeof data.tags === "string") {
//       updateData.tags = data.tags.split(",").map((tag: string) => tag.trim());
//     }
//     if (data.published !== undefined) {
//       updateData.published =
//         data.published === "true" || data.published === true;
//     }

//     if (file) {
//       // Validate file size first
//       if (file.size > 5 * 1024 * 1024) {
//         // 5MB limit
//         return NextResponse.json(
//           { error: "File size exceeds 5MB limit" },
//           { status: 400 }
//         );
//       }

//       let uploadSuccess = false;
//       try {
//         // If there's an old image, delete it
//         if (existingBlog.imageId) {
//           await gfs.delete(new mongoose.Types.ObjectId(existingBlog.imageId));
//         }

//         // Upload new image
//         const buffer = Buffer.from(await file.arrayBuffer());
//         const uploadStream = gfs.openUploadStream(file.name, {
//           contentType: file.type,
//         });

//         uploadStream.write(buffer);
//         uploadStream.end();

//         await new Promise<void>((resolve, reject) => {
//           uploadStream.on("finish", () => {
//             uploadSuccess = true;
//             updateData.imageId = uploadStream.id as mongoose.Types.ObjectId;
//             updateData.imageMimeType = file!.type;
//             resolve();
//           });
//           uploadStream.on("error", (err) => {
//             console.error("GridFS upload error during update:", err);
//             reject(err);
//           });
//         });
//       } catch (error) {
//         // Clean up if upload failed
//         if (!uploadSuccess && updateData.imageId) {
//           await gfs.delete(updateData.imageId);
//         }
//         throw error;
//       }
//     }
//     // If 'removeImage' field is true and no new file, clear image fields
//     else if (data.removeImage === "true" || data.removeImage === true) {
//       if (existingBlog.imageId) {
//         try {
//           await gfs.delete(new mongoose.Types.ObjectId(existingBlog.imageId));
//         } catch (deleteError) {
//           console.warn("Failed to delete image during removal:", deleteError);
//         }
//       }
//       updateData.imageId = undefined; // Using 'undefined' to remove field with Mongoose
//       updateData.imageMimeType = undefined;
//     }

//     const updatedBlog = await BlogModel.findByIdAndUpdate(
//       blogId,
//       { $set: updateData }, // Use $set to ensure only provided fields are updated
//       { new: true, runValidators: true }
//     );

//     if (!updatedBlog) {
//       // This case should ideally be caught by existingBlog check, but as a safeguard:
//       return NextResponse.json(
//         { error: "Blog post not found after update attempt" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(updatedBlog);
//   } catch (error: any) {
//     console.error("Error updating blog post:", error);
//     return NextResponse.json(
//       { error: "Failed to update blog post", details: error.message },
//       { status: 500 }
//     );
//   }
// }

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

    const updateData: Partial<IBlog> = { ...data };
    updateData.updatedAt = new Date();

    if (data.tags && typeof data.tags === "string") {
      updateData.tags = data.tags.split(",").map((tag: string) => tag.trim());
    }
    if (data.published !== undefined) {
      updateData.published =
        data.published === "true" || data.published === true;
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
