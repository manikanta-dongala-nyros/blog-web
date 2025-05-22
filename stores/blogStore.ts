// store/blogStore.ts
import { create } from "zustand";
import { BlogPost } from "@/types/blog";
import Swal from "sweetalert2";

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
  fetchPost: (id: string) => Promise<void>;
  fetchPosts: () => Promise<void>;
}

export const useBlogStore = create<BlogStore>((set) => ({
  posts: [],
  selectedPost: null,
  setSelectedPost: (post: BlogPost) => set({ selectedPost: post }),

  isLoading: false,

  setPosts: (posts) => set({ posts }),
  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),
  updatePost: async (updatedPostData: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/update`, {
        // Using the /api/blog/update route
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPostData), // Send the whole post data, including its 'id'
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to update blog post" }));
        throw new Error(errorData.message || "Failed to update blog post");
      }

      const returnedBlogFromApi = await response.json(); // This object will have _id

      // Map _id from API response to id for store consistency
      const processedBlog = {
        ...returnedBlogFromApi,
        id: returnedBlogFromApi._id.toString(), // Crucial: map _id to id
      };
      // delete processedBlog._id; // Optional: remove _id if you want to keep the object clean

      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === processedBlog.id ? processedBlog : post
        ),
      }));
      // If the component needs to know about success/failure, this function should return or throw.
      // By throwing on error, the component's try/catch will handle it.
    } catch (error: any) {
      console.error("Error updating blog post in store:", error);
      Swal.fire({
        icon: "error",
        title: "Update Error",
        text: error.message || "Failed to update blog post.",
      });
      throw error; // Re-throw to allow component to catch it
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
      Swal.fire({
        icon: "error",
        title: "Delete Error",
        text: "Failed to delete blog post.",
      });
    }
  },
  selectPost: (post) => set({ selectedPost: post }),
  clearSelectedPost: () => set({ selectedPost: null }),
  // fetchPost function to get single post by id
  fetchPost: async (id: string) => {
    try {
      const response = await fetch(`/api/blog/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blog post");
      }
      const post = await response.json();
      set({ selectedPost: post });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: "Failed to fetch blog post.",
      });
    }
  },
  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/blog/list");
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }
      const posts = await response.json();
      console.log("API response posts:", posts); // <-- Check raw data here

      const mappedPosts = posts.map((post: any) => ({
        ...post,
        id: post._id, // Ensure _id is mapped to id
        tags: post.tags ?? [],
      }));

      console.log(
        "Mapped post IDs:",
        mappedPosts.map((p: BlogPost) => p.id) // Explicitly type 'p' as BlogPost
      ); // <-- Check IDs here

      set({ posts: mappedPosts, isLoading: false });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      set({ isLoading: false });
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: "Failed to fetch blog posts.",
      });
    }
  },
}));
