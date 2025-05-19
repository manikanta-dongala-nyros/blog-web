// zod/schemas/blog.ts
import { z } from "zod";

export const blogPostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  content: z.string().min(1, "Content cannot be empty"),
  author: z.string().min(1),
  tags: z.array(z.string()).optional(),
  published: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
