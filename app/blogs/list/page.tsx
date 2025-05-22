"use client";

import { useEffect } from "react";
import { useBlogStore } from "@/stores/blogStore";
import { format } from "date-fns";
import Link from "next/link";
import Swal from "sweetalert2";
import NavBar from "@/components/common/GenericForm/Navbar";
import { useRouter } from "next/navigation"; // Import useRouter
import { useAuthStore } from "@/stores/authStore"; // Import useAuthStore

type Post = {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  tags?: string[];
  content: string;
  imageId?: string;
};

const BlogList = () => {
  const posts = useBlogStore((state) => state.posts) as Post[];
  const isLoading = useBlogStore((state) => state.isLoading);
  const fetchPosts = useBlogStore((state) => state.fetchPosts);
  const deletePost = useBlogStore((state) => state.deletePost);
  const router = useRouter(); // Get router instance
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Get auth state

  // Effect to check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login"); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, router]); // Depend on isAuthenticated and router

  console.log("Posts:", posts);
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    console.log(
      "Blog posts with imageId:",
      posts.map((p) => ({ id: p.id, imageId: p.imageId }))
    );
  }, [posts]);

  const handleDeletePost = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deletePost(id);
        Swal.fire("Deleted!", "Your post has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting post from component:", error);
      }
    }
  };

  return (
    <>
      <NavBar />
      {/* Only render content if authenticated */}
      {isAuthenticated && (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-12 tracking-tight">
              📰 Blog Posts
            </h1>

            <div className="flex justify-end mb-8">
              <Link
                href="/blogs/create"
                className="text-sm bg-green-500 text-white px-6 py-2.5 rounded-full shadow-md hover:bg-green-600 transition-all duration-200"
              >
                + Create Post
              </Link>
            </div>

            {isLoading ? (
              <p className="text-center text-gray-500">⏳ Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-center text-gray-500">
                🚫 No blog posts found.
              </p>
            ) : (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border border-gray-200 shadow-sm hover:shadow-lg rounded-2xl p-6 transition-shadow duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {post.imageId ? (
                        <img
                          src={`/api/image/${post.imageId}`}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/file.svg";
                          }}
                        />
                      ) : (
                        <img
                          src="/file.svg"
                          alt="Placeholder"
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}

                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {post.title}
                      </h2>

                      <p className="text-sm text-gray-500 mb-3">
                        ✍️ <span className="font-medium">{post.author}</span> •{" "}
                        {format(new Date(post.createdAt), "PPP")}
                      </p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {post.tags
                            .filter(
                              (tag): tag is string => typeof tag === "string"
                            )
                            .map((tag) => (
                              <span
                                key={`${post.id}-${tag}`}
                                className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                        </div>
                      )}

                      <p className="mt-4 text-gray-700 text-sm line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <Link
                        href={`/blogs/edit/${post.id}`}
                        onClick={() => useBlogStore.getState().selectPost(post)}
                        className="text-xs bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                      >
                        ✏️ Edit
                      </Link>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-xs bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BlogList;
