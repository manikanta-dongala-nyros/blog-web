import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

import mongoose from "mongoose";
import { getGFS } from "../../blog/[id]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const gfs = await getGFS();
    const db = mongoose.connection.db!;

    const imageIdString = params.id;
    if (!mongoose.Types.ObjectId.isValid(imageIdString)) {
      return NextResponse.json(
        { error: "Invalid image ID format" },
        { status: 400 }
      );
    }
    const imageId = new mongoose.Types.ObjectId(imageIdString);

    const filesCollection = db.collection("uploads.files");
    const fileMeta = await filesCollection.findOne({ _id: imageId });

    if (!fileMeta) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const downloadStream = gfs.openDownloadStream(imageId);

    // Convert Node.js stream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        downloadStream.on("data", (chunk) => controller.enqueue(chunk));
        downloadStream.on("end", () => controller.close());
        downloadStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        downloadStream.destroy();
      },
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": fileMeta.contentType || "application/octet-stream",
        "Content-Length": fileMeta.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: fileMeta._id.toString(),
      },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error retrieving image:", error);
    return NextResponse.json(
      { error: "Failed to retrieve image", details: error.message },
      { status: 500 }
    );
  }
}
