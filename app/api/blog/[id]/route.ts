// import { MongoClient, GridFSBucket, Db, ObjectId } from "mongodb";
// import { NextRequest, NextResponse } from "next/server";
// import BlogModel from "@/models/blogs/blog";

// const uri = process.env.MONGODB_URI!;
// const dbName = process.env.MONGODB_DB!;

// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;
// let gfs: GridFSBucket;
// let dbInstance: Db;

// interface MongoGlobalExtensions {
//   _mongoClientPromise?: Promise<MongoClient>;
//   _mongoGFS?: GridFSBucket;
//   _mongoDbInstance?: Db;
// }

// declare const global: typeof globalThis & MongoGlobalExtensions;

// if (process.env.NODE_ENV === "development") {
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;

//   clientPromise.then((mongoClient) => {
//     dbInstance = mongoClient.db(dbName);
//     gfs = new GridFSBucket(dbInstance, { bucketName: "uploads" });
//     global._mongoGFS = gfs;
//     global._mongoDbInstance = dbInstance;
//   });
// } else {
//   client = new MongoClient(uri);
//   clientPromise = client.connect();

//   clientPromise.then((mongoClient) => {
//     dbInstance = mongoClient.db(dbName);
//     gfs = new GridFSBucket(dbInstance, { bucketName: "uploads" });
//   });
// }

// async function dbConnect(): Promise<MongoClient> {
//   return await clientPromise;
// }

// async function getDb(): Promise<Db> {
//   if (dbInstance) return dbInstance;
//   const mongoClient = await clientPromise;
//   dbInstance = mongoClient.db(dbName);
//   return dbInstance;
// }

// async function getGFS(): Promise<GridFSBucket> {
//   if (gfs) return gfs;
//   const mongoClient = await clientPromise;
//   const db = mongoClient.db(dbName);
//   gfs = new GridFSBucket(db, { bucketName: "uploads" });
//   return gfs;
// }

// // ✅ GET a blog post by ID
// export async function GET(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     await dbConnect();

//     const { id } = context.params;

//     if (!id || !ObjectId.isValid(id)) {
//       return NextResponse.json({ error: "Invalid Blog ID" }, { status: 400 });
//     }

//     const post = await BlogModel.findById(id).lean();
//     if (!post) {
//       return NextResponse.json({ error: "Blog not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       ...post,
//       id: post._id.toString(),
//       _id: undefined,
//     });
//   } catch (error: unknown) {
//     console.error("Error in GET:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch blog post." },
//       { status: 500 }
//     );
//   }
// }

// // ✅ PUT to update a blog post (image upload optional)
// export async function PUT(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     const { id } = await context.params;

//     if (!id || !ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { error: "Invalid or missing Blog ID" },
//         { status: 400 }
//       );
//     }

//     if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
//       return NextResponse.json(
//         {
//           error:
//             'Invalid Content-Type. Use "multipart/form-data" for file uploads.',
//         },
//         { status: 400 }
//       );
//     }

//     const formData = await request.formData();
//     const title = formData.get("title") as string;
//     const content = formData.get("content") as string;
//     const image = formData.get("image") as File | null;

//     const updateData: any = {};
//     if (title) updateData.title = title;
//     if (content) updateData.content = content;

//     if (image && image.size > 0) {
//       const gfs = await getGFS();
//       const buffer = Buffer.from(await image.arrayBuffer());
//       const uploadStream = gfs.openUploadStream(image.name, {
//         contentType: image.type,
//       });
//       uploadStream.end(buffer);

//       updateData.imageId = uploadStream.id;
//     }

//     const updatedPost = await BlogModel.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     if (!updatedPost) {
//       return NextResponse.json({ error: "Blog not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       message: "Blog post updated successfully",
//       post: updatedPost,
//     });
//   } catch (error) {
//     console.error("Error in PUT:", error);
//     return NextResponse.json(
//       { error: "Failed to update blog post." },
//       { status: 500 }
//     );
//   }
// }

// // ✅ DELETE a blog post by ID
// export async function DELETE(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     await dbConnect();

//     const { id } = context.params;
//     if (!id || !ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { error: "Invalid or missing Blog ID" },
//         { status: 400 }
//       );
//     }

//     const deletedPost = await BlogModel.findByIdAndDelete(id);

//     if (!deletedPost) {
//       return NextResponse.json({ error: "Blog not found" }, { status: 404 });
//     }

//     return NextResponse.json(
//       { message: "Blog post deleted successfully" },
//       { status: 200 }
//     );
//   } catch (error: unknown) {
//     console.error("Error in DELETE:", error);
//     return NextResponse.json(
//       { error: "Failed to delete blog post." },
//       { status: 500 }
//     );
//   }
// }

// export { getGFS };

/* ===============================
 * 📁 app/api/blog/[id]/route.ts
 * =============================== */

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
