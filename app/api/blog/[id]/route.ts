import { MongoClient, GridFSBucket, Db } from "mongodb";
import { NextRequest, NextResponse } from "next/server"; // Import NextRequest and NextResponse
import BlogModel from "@/models/blogs/blog"; // Import BlogModel

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

if (!dbName) {
  throw new Error(
    "Please define the MONGODB_DB environment variable inside .env.local"
  );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let gfs: GridFSBucket;
let dbInstance: Db;

// Extend the global object for development
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

  clientPromise
    .then((mongoClient) => {
      dbInstance = mongoClient.db(dbName);
      global._mongoDbInstance = dbInstance;
      gfs = new GridFSBucket(dbInstance, { bucketName: "uploads" });
      global._mongoGFS = gfs;
    })
    .catch((err) =>
      console.error("Failed to connect to MongoDB in development", err)
    );
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();

  clientPromise
    .then((mongoClient) => {
      dbInstance = mongoClient.db(dbName);
      gfs = new GridFSBucket(dbInstance, { bucketName: "uploads" });
    })
    .catch((err) =>
      console.error("Failed to connect to MongoDB in production", err)
    );
}

// ✅ Export a callable function for connecting
export async function dbConnect(): Promise<MongoClient> {
  return await clientPromise;
}

// ✅ Get the connected DB
export async function getDb(): Promise<Db> {
  if (dbInstance) return dbInstance;
  const mongoClient = await clientPromise;
  dbInstance = mongoClient.db(dbName);
  return dbInstance;
}

// ✅ Get the GridFSBucket
export async function getGFS(): Promise<GridFSBucket> {
  if (gfs) return gfs;
  const mongoClient = await clientPromise;
  const db = mongoClient.db(dbName);
  gfs = new GridFSBucket(db, { bucketName: "uploads" });
  return gfs;
}

export default dbConnect;

// Add the GET function to fetch a single blog post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Extract id from params
) {
  try {
    await dbConnect(); // Connect to the database

    const { id } = params; // Get the blog post ID from the URL parameters

    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    // Find the blog post by its ID
    const post = await BlogModel.findById(id).lean(); // Use .lean() for plain JavaScript objects

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Map _id to id for frontend consistency
    const processedPost = {
      ...post,
      id: post._id.toString(),
      _id: undefined, // Remove _id if you prefer
    };

    return NextResponse.json(processedPost); // Return the found post
  } catch (error: unknown) {
    console.error("Error fetching blog post by ID:", error);

    let errorMessage = "Failed to fetch blog post.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
