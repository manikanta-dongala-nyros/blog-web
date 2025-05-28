// types/blog.ts
import { z } from "zod";
import { blogPostSchema } from "@/models/blogs/blog";

export type BlogPost = z.infer<typeof blogPostSchema>;
// src/types/blog.ts

export type PostLike = {
  // <--- Make sure "export" is here
  likesCount: number;
  likedBy: string[];
};

export type Post = {
  // <--- Make sure "export" is here
  id: string;
  _id?: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  userId: string;
  tags: string[];
  published: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  imageId?: string;
  // imageUrl?: string; // uncomment if your API provides this directly
  likes?: PostLike;
};
