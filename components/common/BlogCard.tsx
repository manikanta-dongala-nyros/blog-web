// src/app/blogs/BlogCard.tsx
import Link from "next/link";
import { format } from "date-fns";
import {
  FaHeart,
  FaRegHeart,
  FaEdit,
  FaTrash,
  FaFeatherAlt,
  FaTags,
  FaBookmark,
} from "react-icons/fa";

// Note: In a larger application, these types would ideally be in a shared types file (e.g., src/types/blog.ts)
// and imported into both BlogCard.tsx and BlogList.tsx to avoid duplication.
export type Post = {
  // <--- Add export here
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

export type StoreActionPost = Omit<Post, "likes"> & {
  // <--- Add export here
  likes: {
    likesCount: number;
    likedBy: string[];
  };
};

interface BlogCardProps {
  post: Post;
  currentUserId: string;
  isAuthenticated: boolean;
  onLikePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onSavePost: (postId: string) => void;
  onSelectPost: (post: StoreActionPost) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({
  post,
  currentUserId,
  isAuthenticated,
  onLikePost,
  onDeletePost,
  onSavePost,
  onSelectPost,
}) => {
  const isLikedByUser = post.likes?.likedBy?.includes(currentUserId);

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
    <article className="bg-white rounded-xl shadow-lg hover:shadow-xl border overflow-hidden transition-all duration-300 flex flex-col group">
      <Link href={`/blogs/${post.id}`}>
        <img
          src={post.imageId ? `/api/image/${post.imageId}` : "/file.svg"}
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
          <h2 className="text-2xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors duration-300 mb-2 line-clamp-2">
            {post.title}
          </h2>
        </Link>

        <p className="text-sm text-slate-500 mb-3 flex items-center">
          <FaFeatherAlt className="mr-2 text-sky-500" />
          By{" "}
          <Link
            href={`/users/${post.userId}`}
            className="font-semibold text-slate-700 ml-1 hover:text-sky-600 transition-colors"
          >
            {post.author}
          </Link>
          <span className="mx-2 text-slate-400">•</span>
          {format(new Date(post.createdAt), "MMM d, yyyy")}
        </p>

        {validTags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <FaTags className="text-slate-400 mr-1" />
            {validTags.map((tag) => (
              <span
                key={`${post.id}-${tag}`} // Unique key for tags
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

        <div className="mt-auto border-t pt-4 flex justify-between items-center">
          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onLikePost(post.id);
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

          <div className="flex items-center gap-3">
            {/* Save Button */}
            {isAuthenticated && currentUserId && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSavePost(post.id);
                }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-sky-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-sky-50/70 border border-transparent hover:border-sky-200/70"
                title="Save Post"
              >
                <FaBookmark />
                <span className="hidden md:inline">Save</span>
              </button>
            )}

            {/* Edit and Delete Buttons for post owner */}
            {post.userId === currentUserId && (
              <>
                <Link
                  href={`/blogs/edit/${post.id}`}
                  onClick={() =>
                    onSelectPost({
                      ...post,
                      likes: post.likes || {
                        likesCount: 0,
                        likedBy: [],
                      },
                    } as StoreActionPost)
                  }
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-amber-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50/70 border border-transparent hover:border-amber-200/70"
                  title="Edit Post"
                >
                  <FaEdit />
                  <span className="hidden md:inline">Edit</span>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDeletePost(post.id);
                  }}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50/70 border border-transparent hover:border-red-200/70"
                  title="Delete Post"
                >
                  <FaTrash />
                  <span className="hidden md:inline">Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
