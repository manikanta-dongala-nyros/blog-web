"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBlogStore } from "@/stores/blogStore";
import { BlogPost } from "@/types/blog";
import GenericForm from "@/components/common/GenericForm/GenericForm";
import { FormConfig } from "@/components/common/GenericForm/types";
import Swal from "sweetalert2";
import NavBar from "@/components/common/GenericForm/Navbar";
import useAuthStore from "@/stores/authStore";
import { use } from "react";

const EditBlog = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  const router = useRouter();

  const { updatePost, selectedPost, fetchPost, clearSelectedPost } =
    useBlogStore();
  const {
    isAuthenticated,
    isLoading: authLoading,
    hasHydrated,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    tags: "",
    published: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication first
  useEffect(() => {
    if (hasHydrated && !isAuthenticated && !authLoading) {
      const currentPath = `/blogs/edit/${postId}`;
      useAuthStore.getState().setLastPath(currentPath);
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, authLoading, router, postId]);

  // Load post data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadPostData = async () => {
      try {
        // Try to get from localStorage first
        const storedPost = localStorage.getItem("selectedPost");
        const parsedPost = storedPost ? JSON.parse(storedPost) : null;

        if (parsedPost && parsedPost.id === postId) {
          setFormData({
            title: parsedPost.title,
            content: parsedPost.content,
            author: parsedPost.author,
            tags: parsedPost.tags?.join(", ") || "",
            published: parsedPost.published,
          });
        } else {
          await fetchPost(postId);
        }
      } catch (err) {
        setError("Failed to load post data");
        console.error("Error loading post:", err);
      }
    };

    loadPostData();
  }, [postId, isAuthenticated, fetchPost]);

  useEffect(() => {
    return () => {
      clearSelectedPost();
    };
  }, [clearSelectedPost]);

  const handleSubmit = useCallback(
    async (values: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("content", values.content);
        formData.append("author", values.author);
        formData.append("tags", values.tags);
        formData.append("published", String(values.published));
        formData.append("id", postId); // Add the post ID to the form data

        if (values.image) {
          if (values.image.size > 5 * 1024 * 1024) {
            throw new Error("Image size must be less than 5MB");
          }
          formData.append("image", values.image);
        }

        const response = await fetch(`/api/blog/update`, {
          // Changed endpoint to use /api/blog/update
          method: "PUT",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to update post");
        }

        const postToUpdate: BlogPost = {
          id: postId,
          title: values.title,
          slug: values.title.toLowerCase().replace(/\s+/g, "-"),
          content: values.content,
          author: values.author,
          tags: values.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean),
          published: values.published,
          updatedAt: new Date().toISOString(),
          createdAt: selectedPost?.createdAt || new Date().toISOString(),
        };

        await updatePost(postToUpdate);
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Blog post updated successfully!",
          timer: 1500,
          showConfirmButton: false,
        });

        router.push("/blogs/list");
      } catch (err: any) {
        console.error("Error updating post:", err);
        setError(err.message || "An unexpected error occurred while updating.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to update blog post",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [postId, selectedPost, updatePost, router]
  );

  const editBlogConfig: FormConfig = useMemo(
    () => ({
      fields: [
        {
          name: "title",
          label: "Title",
          type: "text",
          required: true,
        },
        {
          name: "author",
          label: "Author",
          type: "text",
          required: true,
        },
        {
          name: "content",
          label: "Content",
          type: "textarea",
          required: true,
        },
        {
          name: "tags",
          label: "Tags (comma-separated)",
          type: "text",
        },
        {
          name: "published",
          label: "Published",
          type: "checkbox",
        },
        {
          name: "image",
          label: "Featured Image",
          type: "file",
          accept: "image/*",
        },
      ],
      onSubmit: handleSubmit,
      submitLabel: isLoading ? "Updating..." : "Update Post",
    }),
    [handleSubmit, isLoading]
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl px-10 py-12">
          <nav className="text-sm text-gray-500 mb-6">
            <span
              className="cursor-pointer hover:text-blue-600"
              onClick={() => router.push("/")}
            >
              Home
            </span>{" "}
            /{" "}
            <span
              className="cursor-pointer hover:text-blue-600"
              onClick={() => router.push("/blogs/list")}
            >
              Blogs
            </span>{" "}
            / <span className="font-semibold text-gray-700">Edit</span>
          </nav>

          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
            📝 Edit Blog Post
          </h1>

          {isLoading && (
            <div className="text-center text-blue-600 mb-4">
              Updating post...
            </div>
          )}

          {error ? (
            <div className="text-center text-red-600 mb-4">Error: {error}</div>
          ) : selectedPost?.id === postId ? (
            <GenericForm
              {...editBlogConfig}
              initialValues={formData}
              className="space-y-6"
            />
          ) : (
            <p className="text-center text-gray-500">Loading post...</p>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/blogs/list")}
              className="mt-4 inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md transition"
            >
              ← Back to Blog List
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditBlog;
