// store/blogStore.ts
import { create } from "zustand";
import { BlogPost } from "@/types/blog";

interface BlogStore {
  posts: BlogPost[];
  selectedPost: BlogPost | null;
  isLoading: boolean;

  setPosts: (posts: BlogPost[]) => void;
  addPost: (post: BlogPost) => void;
  updatePost: (updatedPost: BlogPost) => Promise<void>;
  deletePost: (id: string) => void;
  selectPost: (post: BlogPost) => void;
  clearSelectedPost: () => void;
  fetchPosts: () => Promise<void>;
}

export const useBlogStore = create<BlogStore>((set) => ({
  posts: [],
  selectedPost: null,
  isLoading: false,

  setPosts: (posts) => set({ posts }),
  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),
  updatePost: async (updatedPost) => {
    try {
      const response = await fetch(`/api/blog/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPost),
      });

      if (!response.ok) {
        throw new Error("Failed to update blog post");
      }

      const updatedData = await response.json();
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === updatedData.id ? updatedData : post
        ),
      }));
    } catch (error) {
      console.error("Error updating blog post:", error);
    }
  },
  deletePost: async (id: string) => {
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog post");
      }

      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting blog post:", error);
    }
  },
  selectPost: (post) => set({ selectedPost: post }),
  clearSelectedPost: () => set({ selectedPost: null }),
  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/blog/list");
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }
      const posts = await response.json();
      // Map _id to id and specify the type of post
      const mappedPosts = posts.map((post: any) => ({
        ...post,
        id: post._id, // Ensure _id is mapped to id
      }));
      set({ posts: mappedPosts, isLoading: false });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      set({ isLoading: false });
    }
  },
}));
