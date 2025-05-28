"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Swal from "sweetalert2";
import NavBar from "@/components/common/GenericForm/Navbar";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { getCookie } from "cookies-next";
import {
  FaSpinner,
  FaPlus,
  FaHeart,
  FaRegHeart,
  FaEdit,
  FaTrash,
  FaFeatherAlt,
  FaTags,
  FaExclamationCircle,
  FaUserCircle, // Icon for My Blogs
} from "react-icons/fa";
import { useBlogStore } from "@/stores/blogStore"; // For delete and like functionality if needed

// Define the Post type, ensure it matches your data structure
// This can be imported from your types/blog.ts if it's defined there
type Post = {
  id: string;
  _id?: string; // if your API returns _id
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
  likes?: {
    likesCount: number;
    likedBy: string[];
  };
};

const MyBlogsPage = () => {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, hydrate } = useAuthStore();
  const hasHydrated = useAuthStore((state) => !state.isLoading);
  const router = useRouter();
  const currentUserId = String(getCookie("userId") || "");

  // For delete and like functionality, similar to BlogList
  const globalFetchPosts = useBlogStore((state) => state.fetchPosts);
  const deletePostStore = useBlogStore((state) => state.deletePost);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (hasHydrated && isAuthenticated && currentUserId) {
      const fetchMyPosts = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/blog/author/${currentUserId}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to fetch your blogs");
          }
          const data = await res.json();
          // Ensure 'id' field is present, map from '_id' if necessary
          const processedData = data.map((post: any) => ({
            ...post,
            id: post._id || post.id,
          }));
          setMyPosts(processedData);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMyPosts();
    }
  }, [hasHydrated, isAuthenticated, currentUserId]);

  const showThemedSwal = (options: any) => {
    Swal.fire({
      background: "#ffffff",
      color: "#1f2937",
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#9ca3af",
      ...options,
    });
  };

  // Simplified likePost function (can be imported or adapted)
  const likePost = async (postId: string, userId: string) => {
    try {
      const res = await fetch("/api/blog/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Like failed");
      return data;
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUserId) {
      showThemedSwal({
        title: "Unauthorized",
        text: "Please login.",
        icon: "warning",
      });
      return;
    }
    const res = await likePost(postId, currentUserId);
    if (res.error) {
      showThemedSwal({ title: "Error", text: res.error, icon: "error" });
      return;
    }
    // Re-fetch this user's posts to update likes
    const updatedPosts = myPosts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          likes: { likesCount: res.likesCount, likedBy: res.likedBy },
        };
      }
      return p;
    });
    setMyPosts(updatedPosts);
    // Optionally, also refresh the global store if these posts are also in the main list
    // globalFetchPosts();
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
        await deletePostStore(id); // Uses blogStore's deletePost
        setMyPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
        showThemedSwal({
          title: "Deleted!",
          text: "Your post has been deleted.",
          icon: "success",
        });
      } catch (err) {
        showThemedSwal({
          title: "Error",
          text: err instanceof Error ? err.message : "Failed to delete.",
          icon: "error",
        });
      }
    }
  };

  if (!hasHydrated || (isAuthenticated && isLoading && !currentUserId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 flex items-center justify-center text-slate-700">
        <FaSpinner className="animate-spin text-4xl mr-3 text-sky-500" />
        Loading your information...
      </div>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 px-4 py-12 flex flex-col items-center justify-center">
          <FaExclamationCircle className="text-7xl mx-auto mb-6 text-red-500" />
          <p className="text-2xl font-semibold text-slate-700">
            Error Loading Your Blogs
          </p>
          <p className="text-slate-500 mt-2">{error}</p>
          <Link
            href="/blogs/list"
            className="mt-6 text-sky-600 hover:text-sky-700 font-semibold"
          >
            Back to all blogs
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 px-4 py-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 pb-2 flex items-center justify-center">
              <FaUserCircle className="mr-3" /> My Blogs
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Here are all the amazing posts you've shared.
            </p>
          </div>

          <div className="flex justify-end mb-10">
            <Link
              href={`/blogs/create/${currentUserId}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-sky-400/50 hover:shadow-sky-500/60 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50"
            >
              <FaPlus /> Create New Post
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-slate-600 h-64">
              <FaSpinner className="animate-spin text-5xl mb-4 text-sky-500" />
              <p className="text-xl">Loading your posts...</p>
            </div>
          ) : myPosts.length === 0 ? (
            <div className="text-center text-slate-500 py-16">
              <FaExclamationCircle className="text-7xl mx-auto mb-6 text-slate-400" />
              <p className="text-2xl font-semibold text-slate-700">
                You haven't created any posts yet.
              </p>
              <p className="text-slate-500 mt-2">
                Why not share your first story today?
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myPosts.map((post) => {
                const isLikedByUser =
                  post.likes?.likedBy?.includes(currentUserId);
                const validTags = Array.isArray(post.tags)
                  ? post.tags.filter(
                      (tag): tag is string =>
                        typeof tag === "string" &&
                        tag.trim() !== "" &&
                        tag.trim().toLowerCase() !== "undefined" &&
                        tag.trim().toLowerCase() !== "null"
                    )
                  : [];

                return (
                  <article
                    key={post.id} // Ensure post.id is used here
                    className="bg-white rounded-xl shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-sky-500/15 border border-gray-200/80 overflow-hidden transition-all duration-300 flex flex-col group"
                  >
                    <Link href={`/blogs/${post.id}`} className="block">
                      <img
                        src={
                          post.imageId
                            ? `/api/image/${post.imageId}`
                            : "/file.svg"
                        }
                        alt={post.title || "Blog post image"}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300 bg-slate-200"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/file.svg";
                        }}
                      />
                    </Link>
                    <div className="p-6 flex flex-col flex-grow">
                      <Link href={`/blogs/${post.id}`}>
                        <h2
                          className="text-2xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors duration-300 mb-2 line-clamp-2"
                          title={post.title}
                        >
                          {post.title}
                        </h2>
                      </Link>
                      <p className="text-sm text-slate-500 mb-3 flex items-center">
                        <FaFeatherAlt className="mr-2 text-sky-500" />
                        By{" "}
                        <span className="font-semibold text-slate-700 ml-1">
                          You
                        </span>
                        <span className="mx-2 text-slate-400">•</span>
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </p>

                      {validTags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2 items-center">
                          <FaTags className="text-slate-400 mr-1" />
                          {validTags.map((tag) => (
                            <span
                              key={`${post.id}-${tag}`}
                              className="bg-sky-50 text-sky-600 text-xs px-2.5 py-1 rounded-full font-medium border border-sky-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4 flex-grow">
                        {post.content}
                      </p>

                      <div className="mt-auto border-t border-gray-200/80 pt-4 flex justify-between items-center">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleLikePost(post.id);
                          }}
                          disabled={!currentUserId}
                          className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg group ${
                            isLikedByUser
                              ? "text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                              : "text-slate-500 hover:text-red-500 hover:bg-red-50/70 border border-transparent hover:border-red-200/70"
                          } ${
                            !currentUserId
                              ? "opacity-60 cursor-not-allowed pointer-events-none"
                              : ""
                          }`}
                          title={
                            !currentUserId
                              ? "Login to like"
                              : isLikedByUser
                              ? "Unlike"
                              : "Like"
                          }
                        >
                          {isLikedByUser ? (
                            <FaHeart className="text-red-500" />
                          ) : (
                            <FaRegHeart
                              className={
                                !isLikedByUser && currentUserId
                                  ? "group-hover:text-red-500"
                                  : ""
                              }
                            />
                          )}
                          {post.likes?.likesCount || 0}
                          <span className="hidden sm:inline ml-1">
                            {post.likes?.likesCount === 1 ? "Like" : "Likes"}
                          </span>
                        </button>

                        {/* Edit and Delete buttons for user's own posts */}
                        <div className="flex gap-3 items-center">
                          <Link
                            href={`/blogs/edit/${post.id}`}
                            className="flex items-center gap-1 text-sm text-slate-500 hover:text-amber-500 transition-colors"
                            title="Edit Post"
                          >
                            <FaEdit />
                            <span className="hidden md:inline">Edit</span>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeletePost(post.id);
                            }}
                            className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition-colors"
                            title="Delete Post"
                          >
                            <FaTrash />
                            <span className="hidden md:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyBlogsPage;
