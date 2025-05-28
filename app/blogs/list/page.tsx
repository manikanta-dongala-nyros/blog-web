// src/app/blogs/BlogList.tsx
"use client";

import { useEffect, useState } from "react";
import { useBlogStore } from "@/stores/blogStore";
import Link from "next/link";
import Swal from "sweetalert2";
import NavBar from "@/components/common/GenericForm/Navbar";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { getCookie } from "cookies-next";
import SearchBar from "@/components/common/SearchBar";
import { FaSpinner, FaPlus, FaExclamationCircle } from "react-icons/fa";

// Import the new BlogCard component
import BlogCard from "@/components/common/BlogCard";

type LikeResponse = {
  message: string;
  likesCount: number;
  likedBy: string[];
  error?: string;
};

const likePost = async (
  postId: string,
  userId: string
): Promise<LikeResponse> => {
  try {
    const res = await fetch("/api/blog/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, userId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    return data;
  } catch (error: any) {
    return { message: "", likesCount: 0, likedBy: [], error: error.message };
  }
};

// Note: In a larger application, these types would ideally be in a shared types file (e.g., src/types/blog.ts)
// and imported here, rather than being duplicated or assumed from BlogCard.
type Post = {
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
  imageMimeType?: string;
  likes?: {
    likesCount: number;
    likedBy: string[];
  };
};

type StoreActionPost = Omit<Post, "likes"> & {
  likes: {
    likesCount: number;
    likedBy: string[];
  };
};

const BlogList = () => {
  const posts = useBlogStore((state) => state.posts) as Post[];
  const isLoading = useBlogStore((state) => state.isLoading);
  const fetchPosts = useBlogStore((state) => state.fetchPosts);
  const deletePost = useBlogStore((state) => state.deletePost);
  const selectPost = useBlogStore((state) => state.selectPost);

  const { isAuthenticated, hydrate } = useAuthStore();
  const hasHydrated = useAuthStore((state) => !state.isLoading);
  const router = useRouter();
  const currentUserId = String(getCookie("userId") || ""); // Renamed from 'userId' for clarity

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (hasHydrated && isAuthenticated && !isLoading && posts.length === 0) {
      fetchPosts();
    }
  }, [hasHydrated, isAuthenticated, isLoading, posts.length, fetchPosts]);

  const showThemedSwal = (options: any) => {
    Swal.fire({
      background: "#ffffff",
      color: "#1f2937",
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#9ca3af",
      ...options,
    });
  };
  const handleLikePost = async (postId: string) => {
    if (
      currentUserId === "" ||
      currentUserId === "undefined" ||
      currentUserId === "null"
    ) {
      showThemedSwal({
        title: "Unauthorized",
        text: "Please login to like posts.",
        icon: "warning",
      });
      return;
    }
    const res = await likePost(postId, currentUserId);
    if (res.error) {
      showThemedSwal({ title: "Error", text: res.error, icon: "error" });
      return;
    }
    fetchPosts(); // Refresh posts to update like status
  };

  const handleDeletePost = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      background: "#ffffff",
      color: "#1f2937",
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#9ca3af",
    });

    if (result.isConfirmed) {
      try {
        await deletePost(id);
        showThemedSwal({
          title: "Deleted!",
          text: "Your post has been deleted.",
          icon: "success",
        });
        fetchPosts(); // Refresh posts list
      } catch (error) {
        showThemedSwal({
          title: "Error",
          text:
            error instanceof Error
              ? error.message
              : "Failed to delete the post.",
          icon: "error",
        });
      }
    }
  };

  const handleSavePost = async (postId: string) => {
    if (
      !currentUserId ||
      currentUserId === "undefined" ||
      currentUserId === "null"
    ) {
      showThemedSwal({
        title: "Unauthorized",
        text: "Please login to save posts.",
        icon: "warning",
      });
      return;
    }

    try {
      const res = await fetch("/api/blog/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUserId, postId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save post.");
      }

      showThemedSwal({
        title: "Saved!",
        text: "Post added to your saved list.",
        icon: "success",
      });
      // Optionally, update local state or refetch if save status needs to be reflected visually immediately
    } catch (error: any) {
      showThemedSwal({
        title: "Error",
        text: error.message || "An error occurred.",
        icon: "error",
      });
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      (post &&
        post.title &&
        post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 flex items-center justify-center text-slate-700">
        <FaSpinner className="animate-spin text-4xl mr-3 text-sky-500" />
        Authenticating or Redirecting...
      </div>
    );
  }

  if (isLoading && posts.length === 0) {
    return (
      <>
        <NavBar />
        <div className="flex flex-col items-center justify-center text-slate-600 h-screen-minus-navbar">
          <FaSpinner className="animate-spin text-5xl mb-4 text-sky-500" />
          <p className="text-xl">Loading posts...</p>
        </div>
      </>
    );
  }
  console.log(posts);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 px-4 py-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 pb-2">
              Blog Central
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Discover inspiring articles and share your voice.
            </p>
          </div>

          {isAuthenticated && currentUserId && (
            <div className="flex justify-end mb-10">
              <Link
                href={`/blogs/create/${currentUserId}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-sky-400/50 hover:shadow-sky-500/60 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50"
              >
                <FaPlus /> Create Post
              </Link>
            </div>
          )}

          <div className="mb-10 max-w-xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search blog titles..."
            />
          </div>

          {!isLoading && posts.length === 0 && searchQuery === "" ? (
            <div className="text-center text-slate-500 py-16">
              <FaExclamationCircle className="text-7xl mx-auto mb-6 text-slate-400" />
              <p className="text-2xl font-semibold text-slate-700">
                No blog posts found.
              </p>
              <p className="text-slate-500 mt-2">
                Why not be the first to share something amazing?
              </p>
              {isAuthenticated && currentUserId && (
                <Link
                  href={`/blogs/create/${currentUserId}`}
                  className="mt-6 inline-block px-6 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Create Your First Post
                </Link>
              )}
            </div>
          ) : !isLoading &&
            posts.length > 0 &&
            filteredPosts.length === 0 &&
            searchQuery !== "" ? (
            <div className="text-center text-slate-500 py-16">
              <FaExclamationCircle className="text-7xl mx-auto mb-6 text-slate-400" />
              <p className="text-2xl font-semibold text-slate-700">
                No results found for "{searchQuery}"
              </p>
              <p className="text-slate-500 mt-2">
                Try adjusting your search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  isAuthenticated={isAuthenticated}
                  onLikePost={handleLikePost}
                  onDeletePost={handleDeletePost}
                  onSavePost={handleSavePost}
                  onSelectPost={selectPost} // Pass the selectPost action from the store
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogList;
