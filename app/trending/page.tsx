"use client";

import { useEffect, useState } from "react";
import { useBlogStore } from "@/stores/blogStore";
import NavBar from "@/components/common/GenericForm/Navbar";
import BlogCard from "@/components/common/BlogCard";
import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import Swal from "sweetalert2";
import { FaSpinner, FaExclamationCircle } from "react-icons/fa";

// Assuming Post type is similar to what's used in BlogList
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

const TrendingPostsPage = () => {
  const router = useRouter();
  const posts = useBlogStore((state) => state.posts);
  const isLoading = useBlogStore((state) => state.isLoading);
  const fetchPosts = useBlogStore((state) => state.fetchPosts);
  const error = useBlogStore((state) => state.error);

  const { isAuthenticated, hydrate, isLoading: authIsLoading } = useAuthStore();
  const currentUserId = String(getCookie("userId") || "");

  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);

  useEffect(() => {
    hydrate(); // Hydrate auth store
  }, [hydrate]);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts(); // Fetch all posts
    }
  }, [isAuthenticated, fetchPosts]);

  useEffect(() => {
    if (posts && posts.length > 0) {
      const sortedPosts = [...posts]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10);
      setTrendingPosts(sortedPosts);
    }
  }, [posts]);

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
    if (!currentUserId) {
      showThemedSwal({
        title: "Unauthorized",
        text: "Please login to like posts.",
        icon: "warning",
      });
      return;
    }
    // Simplified: In a real app, you'd call your like API and then re-fetch or update state
    // For now, just re-fetch all posts to update UI
    try {
      const res = await fetch("/api/blog/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: currentUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      fetchPosts(); // Refresh posts to update like status
    } catch (err: any) {
      showThemedSwal({ title: "Error", text: err.message, icon: "error" });
    }
  };

  // Dummy handlers for BlogCard props that might not be used on this page
  const handleDeletePost = async (postId: string) => {
    showThemedSwal({
      title: "Not Implemented",
      text: "Delete functionality is not available on the trending page.",
      icon: "info",
    });
  };

  const handleSavePost = async (postId: string) => {
    if (!currentUserId) {
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
        icon: "success",
        title: "Post Saved!",
        text: data.message || "Successfully saved the post.",
      });
      // Optionally, refresh saved posts or update UI to reflect saved state
    } catch (err: any) {
      showThemedSwal({
        icon: "error",
        title: "Error Saving Post",
        text: err.message || "Could not save the post.",
      });
    }
  };

  if (
    authIsLoading ||
    (isAuthenticated && isLoading && posts.length === 0 && !error)
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100">
        <FaSpinner className="animate-spin text-4xl mb-4" />
        <p>Loading trending posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-red-400">
        <FaExclamationCircle className="text-4xl mb-4" />
        <p>Error loading posts: {error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally be handled by the redirect, but as a fallback:
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-slate-100">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500">
              Trending Posts
            </span>
          </h1>
          <p className="mt-4 text-xl text-slate-400">
            Discover the top 10 newest posts from our community.
          </p>
        </header>

        {trendingPosts.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <FaExclamationCircle className="mx-auto text-4xl text-slate-500 mb-4" />
            <p className="text-xl text-slate-500">
              No trending posts found at the moment.
            </p>
          </div>
        )}

        {trendingPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                isAuthenticated={isAuthenticated}
                onLikePost={handleLikePost}
                onDeletePost={handleDeletePost} // Or pass a no-op/disabled state
                onSavePost={handleSavePost} // Or pass a no-op/disabled state
                onSelectPost={() => router.push(`/blogs/${post.id}`)}
                // isInitiallySaved might need to be fetched or managed if you want accurate save status here
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TrendingPostsPage;
