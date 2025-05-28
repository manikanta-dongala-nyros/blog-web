import { MongoClient, GridFSBucket, Db, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import BlogModel from "@/models/blogs/blog";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let gfs: GridFSBucket;
let dbInstance: Db;

interface MongoGlobalExtensions {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoGFS?: GridFSBucket;
  _mongoDbInstance?: Db;
}

declare const global: typeof globalThis & MongoGlobalExtensions;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;

  clientPromise.then((mongoClient) => {
    dbInstance = mongoClient.db(dbName);
    gfs = new GridFSBucket(dbInstance, { bucketName: "uploads" });
    global._mongoGFS = gfs;
    global._mongoDbInstance = dbInstance;
  });
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();

  clientPromise.then((mongoClient) => {
    dbInstance = mongoClient.db(dbName);
    gfs = new GridFSBucket(dbInstance, { bucketName: "uploads" });
  });
}

export async function getGFS(): Promise<GridFSBucket> {
  if (gfs) return gfs;
  const mongoClient = await clientPromise;
  const db = mongoClient.db(dbName);
  gfs = new GridFSBucket(db, { bucketName: "uploads" });
  return gfs;
}

// GET /api/blog/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Blog ID" }, { status: 400 });
    }

    const post = await BlogModel.findById(id).lean();
    if (!post) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...post,
      id: post._id.toString(),
      _id: undefined,
    });
  } catch (error: unknown) {
    console.error("Error in GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post." },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Blog ID" }, { status: 400 });
    }

    const post = await BlogModel.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Remove the associated image if exists
    if (post.imageId) {
      const bucket = await getGFS();
      try {
        await bucket.delete(new ObjectId(post.imageId));
      } catch (err) {
        console.warn("Warning: Failed to delete image from GridFS", err);
      }
    }

    // Remove blog post
    await BlogModel.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Blog post deleted successfully." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in DELETE:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post." },
      { status: 500 }
    );
  }
}
