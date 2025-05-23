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
  isLoading: false,

  setPosts: (posts) => set({ posts }),

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  selectPost: (post) => {
    set({ selectedPost: post });
    localStorage.setItem("selectedPost", JSON.stringify(post));
  },

  clearSelectedPost: () => {
    set({ selectedPost: null });
    localStorage.removeItem("selectedPost");
  },

  fetchPost: async (id: string) => {
    try {
      const response = await fetch(`/api/blog/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blog post");
      }
      const post = await response.json();
      set({ selectedPost: post });
      localStorage.setItem("selectedPost", JSON.stringify(post));
    } catch (error) {
      console.error("Error fetching blog post:", error);
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: "Failed to fetch blog post.",
      });
    }
  },

  updatePost: async (updatedPostData: BlogPost) => {
    try {
      const formData = new FormData();
      Object.entries(updatedPostData).forEach(([key, value]) => {
        if (key === "tags" && Array.isArray(value)) {
          formData.append(key, value.join(","));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(`/api/blog/update`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to update blog post" }));
        throw new Error(errorData.message || "Failed to update blog post");
      }

      const returnedBlogFromApi = await response.json();

      const processedBlog = {
        ...returnedBlogFromApi,
        id: returnedBlogFromApi._id.toString(),
      };

      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === processedBlog.id ? processedBlog : post
        ),
        selectedPost: processedBlog,
      }));
    } catch (error: any) {
      console.error("Error updating blog post in store:", error);
      throw error;
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

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/blog/list");
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }
      const posts = await response.json();

      const mappedPosts = posts.map((post: any) => ({
        ...post,
        id: post._id,
        tags: post.tags ?? [],
      }));

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

// Add hydration for blog store
const hydrateStore = () => {
  const storedPost = localStorage.getItem("selectedPost");
  if (storedPost) {
    useBlogStore.setState({ selectedPost: JSON.parse(storedPost) });
  }
};

// Export hydration function
export const hydrateBlogStore = hydrateStore;
