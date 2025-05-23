import mongoose, { Document, Schema, Model } from "mongoose";
import { z } from "zod";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  author: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageId?: mongoose.Types.ObjectId; // Stores the ID of the image in GridFS
  imageMimeType?: string; // Stores the MIME type of the image
}

export const BlogSchema: Schema<IBlog> = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  imageId: { type: mongoose.Schema.Types.ObjectId, required: false },
  imageMimeType: { type: String, required: false },
});

// Create a Zod schema for blog posts
export const blogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  author: z.string(),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().default(false),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  imageId: z.string().optional(),
  imageMimeType: z.string().optional(),
});

// Ensure the model is not recompiled if it already exists
const BlogModel: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default BlogModel;
