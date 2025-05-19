// types/blog.ts
import { z } from "zod";
import { blogPostSchema } from "@/models/blogs/blog";

export type BlogPost = z.infer<typeof blogPostSchema>;
