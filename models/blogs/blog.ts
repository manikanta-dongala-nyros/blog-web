import mongoose, { Document, Schema, Model } from "mongoose";
import { z } from "zod";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  author: string;
  userId: string; // Add userId field
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageId?: mongoose.Types.ObjectId;
  imageMimeType?: string;

  likes: {
    likesCount: number; // Correct type to number
    likedBy: string[]; // Correct type to array of strings
  };
}

export const BlogSchema: Schema<IBlog> = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  userId: { type: String, required: true }, // Add userId field with required constraint
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  imageId: { type: mongoose.Schema.Types.ObjectId, required: false },
  imageMimeType: { type: String, required: false },

  likes: {
    likesCount: { type: Number, default: 0 },
    likedBy: [{ type: String, default: [] }],
  },
});

// Update Zod schema to include userId
export const blogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  author: z.string(),
  userId: z.string(), // Add userId validation
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().default(false),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  imageId: z.string().optional(),
  imageMimeType: z.string().optional(),

  likes: z
    .object({
      likesCount: z.number().nonnegative(),
      likedBy: z.array(z.string()).optional().default([]),
    })
    .default({ likesCount: 0, likedBy: [] }),
});

const BlogModel: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default BlogModel;
