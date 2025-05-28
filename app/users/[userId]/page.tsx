"use client";

// Component: UserBlogList
// Description: Displays blogs of a specific user. Allows logged-in users to like, delete, or save posts.
// Features: Authentication check, blog fetch by user ID, blog interaction handlers (like, delete, save)

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "@/components/common/GenericForm/Navbar";
import useAuthStore from "@/stores/authStore";
import { useBlogStore } from "@/stores/blogStore";
import Swal from "sweetalert2";
import BlogCard, {
  Post as BlogCardPostType,
  StoreActionPost,
} from "@/components/common/BlogCard";

const UserBlogList = () => {
  const router = useRouter();
  const params = useParams();
  const pageUserId = params.userId as string;
  const [userBlogs, setUserBlogs] = useState<BlogCardPostType[]>([]);
  const [loading, setLoading] = useState(true);

  const { user: currentUser, isAuthenticated, hasHydrated } = useAuthStore();
  const blogStore = useBlogStore();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Fetch blogs written by the user
  useEffect(() => {
    const fetchUserBlogs = async () => {
      if (!pageUserId) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/blog/author/${pageUserId}`);
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to fetch user's blogs" }));
          throw new Error(errorData.message || "Failed to fetch user's blogs");
        }
        const data = await response.json();
        const formattedData = data.map((blog: any) => ({
          ...blog,
          id: blog.id || blog._id,
          slug: blog.slug || blog.id || blog._id,
          userId: blog.userId || blog.authorId,
          likes: blog.likes || { likesCount: 0, likedBy: [] },
        })) as BlogCardPostType[];
        setUserBlogs(formattedData);
      } catch (error) {
        console.error("Error fetching user blogs:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error instanceof Error
              ? error.message
              : "Failed to fetch user's blogs",
        });
      } finally {
        setLoading(false);
      }
    };

    if (pageUserId && hasHydrated && isAuthenticated) {
      fetchUserBlogs();
    } else if (hasHydrated && !isAuthenticated) {
      setLoading(false);
    }
  }, [pageUserId, hasHydrated, isAuthenticated]);

  // Handle like/unlike functionality for a post
  const handleLikePost = async (postId: string) => {
    if (!currentUser?.user?._id) {
      Swal.fire("Login Required", "Please login to like posts.", "info");
      return;
    }

    const currentUserId = currentUser.user._id;

    try {
      setUserBlogs((prevBlogs) =>
        prevBlogs.map((blog) => {
          if (blog.id === postId) {
            const blogLikes = blog.likes || { likesCount: 0, likedBy: [] };
            const alreadyLiked = blogLikes.likedBy.includes(currentUserId);
            return {
              ...blog,
              likes: {
                likesCount: alreadyLiked
                  ? blogLikes.likesCount - 1
                  : blogLikes.likesCount + 1,
                likedBy: alreadyLiked
                  ? blogLikes.likedBy.filter((id) => id !== currentUserId)
                  : [...blogLikes.likedBy, currentUserId],
              },
            };
          }
          return blog;
        })
      );
      await blogStore.likePost(postId, currentUserId);
    } catch (error) {
      console.error("Failed to like post:", error);
      Swal.fire("Error", "Could not update like status.", "error");
    }
  };

  // Handle blog deletion with confirmation
  const handleDeletePost = async (postId: string) => {
    if (!currentUser?.id) return;

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await blogStore.deletePost(postId);
          setUserBlogs((prevBlogs) =>
            prevBlogs.filter((blog) => blog.id !== postId)
          );
          Swal.fire("Deleted!", "Your post has been deleted.", "success");
        } catch (error) {
          console.error("Failed to delete post:", error);
          Swal.fire("Error", "Could not delete the post.", "error");
        }
      }
    });
  };

  // Placeholder for save post functionality
  const handleSavePost = async (postId: string) => {
    console.log("Save post:", postId);
    Swal.fire(
      "Saved!",
      "Post saved for later (feature placeholder).",
      "success"
    );
  };

  // Handle selecting a post for editing
  const handleSelectPost = (post: StoreActionPost) => {
    blogStore.selectPost(post);
    console.log("Post selected for editing (data set in store):", post);
  };

  if (!hasHydrated) {
    return <div className="p-8 text-center">🔄 Authenticating...</div>;
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-12 tracking-tight">
            {currentUser?.id === pageUserId ? "My Blogs" : "User's Blogs"}
          </h1>

          {loading ? (
            <p className="text-center text-gray-500">⏳ Loading blogs...</p>
          ) : userBlogs.length === 0 ? (
            <p className="text-center text-gray-500">No blogs found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  post={blog}
                  currentUserId={currentUser?.id || ""}
                  isAuthenticated={isAuthenticated}
                  onLikePost={handleLikePost}
                  onDeletePost={handleDeletePost}
                  onSavePost={handleSavePost}
                  onSelectPost={handleSelectPost}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserBlogList;
