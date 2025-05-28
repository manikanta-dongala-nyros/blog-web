"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import NavBar from "@/components/common/GenericForm/Navbar";
import { getCookie } from "cookies-next";
import { useBlogStore } from "@/stores/blogStore"; // Import useBlogStore

const DEFAULT_IMAGE = "/file.svg";

type Post = {
  _id: string;
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

interface PostPageProps {
  params: {
    id: string;
  };
}

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
    console.error("Error liking post:", error.message);
    return { message: "", likesCount: 0, likedBy: [], error: error.message };
  }
};

const PostPage = ({ params }: PostPageProps) => {
  const postId = params.id;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = getCookie("userId") as string | undefined;
  const [likesCount, setLikesCount] = useState(0);
  const [likedBy, setLikedBy] = useState<string[]>([]);

  const fetchPostsGlobal = useBlogStore((state) => state.fetchPosts); // Get fetchPosts from the store

  const userHasLiked = userId ? likedBy.includes(userId) : false;

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blog/${postId}`);
        if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);

        const data: Post = await res.json();
        setPost(data);
        setLikesCount(data.likes?.likesCount || 0);
        setLikedBy(data.likes?.likedBy || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (postId) fetchPost();
  }, [postId]);

  const handleLikeClick = async () => {
    if (!userId) {
      alert("You must be logged in to like posts.");
      return;
    }

    // Optimistic UI update
    const prevLiked = userHasLiked;
    setLikesCount((count) => (prevLiked ? count - 1 : count + 1));
    setLikedBy((arr) =>
      prevLiked ? arr.filter((id) => id !== userId) : [...arr, userId]
    );

    const result = await likePost(postId, userId);

    if (result.error) {
      // Revert optimistic update
      setLikesCount((count) => (prevLiked ? count + 1 : count - 1));
      setLikedBy((arr) =>
        prevLiked ? [...arr, userId] : arr.filter((id) => id !== userId)
      );
      alert(`Error: ${result.error}`);
    } else {
      setLikesCount(result.likesCount);
      setLikedBy(result.likedBy);
      fetchPostsGlobal(); // Call fetchPosts to update the global store
    }
  };

  if (loading) {
    return <p className="text-center mt-12">⏳ Loading post...</p>;
  }

  if (error) {
    return <p className="text-center mt-12 text-red-500">❌ Error: {error}</p>;
  }

  if (!post) {
    return <p className="text-center mt-12">🚫 Post not found.</p>;
  }

  return (
    <>
      <NavBar />
      <main className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-4">
          ✍️ <strong>{post.author}</strong> •{" "}
          {format(new Date(post.createdAt), "PPP")}
        </p>

        {post.tags?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <img
          src={post.imageId ? `/api/image/${post.imageId}` : DEFAULT_IMAGE}
          alt={post.title || "Blog image"}
          className="w-full max-h-96 object-cover rounded mb-6"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_IMAGE;
          }}
        />

        <article className="prose max-w-none mb-6 whitespace-pre-wrap">
          {post.content}
        </article>

        <button
          onClick={handleLikeClick}
          className={`cursor-pointer transition-colors duration-200 focus:outline-none flex items-center gap-2 px-3 py-1 rounded ${
            userHasLiked
              ? "text-red-600 border-2 border-red-600 bg-red-100"
              : "text-gray-700 hover:text-red-500"
          }`}
          aria-label={userHasLiked ? "Unlike post" : "Like post"}
        >
          ❤️ <span>{likesCount}</span>
        </button>
      </main>
    </>
  );
};

export default PostPage;
