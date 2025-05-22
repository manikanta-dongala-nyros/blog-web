// lib/gridfs.ts
import { GridFSBucket } from "mongodb";
import clientPromise from "./mongodb";

export async function saveToGridFS(buffer: Buffer, filename: string) {
  const client = await clientPromise;
  const db = client.db(); // default DB or specify your DB here
  const bucket = new GridFSBucket(db, { bucketName: "images" });

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename);
    uploadStream.end(buffer);

    uploadStream.on("finish", () => resolve(uploadStream.id));
    uploadStream.on("error", (err) => reject(err));
  });
}
