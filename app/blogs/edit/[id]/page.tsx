"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useBlogStore } from "@/stores/blogStore";
import { BlogPost } from "@/types/blog";
import GenericForm from "@/components/common/GenericForm/GenericForm";
import { FormConfig } from "@/components/common/GenericForm/types";

const EditBlog = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const updatePost = useBlogStore((state) => state.updatePost);
  const posts = useBlogStore((state) => state.posts);

  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    tags: "",
    published: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        author: post.author,
        tags: post.tags?.join(", ") || "",
        published: post.published,
      });
    } else {
      setError("Blog post not found.");
    }
  }, [postId, posts]);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const updatedPost: BlogPost = {
      id: postId,
      title: values.title,
      slug: values.title.toLowerCase().replace(/\s+/g, "-"),
      content: values.content,
      author: values.author,
      tags: values.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag !== ""),
      published: values.published,
      updatedAt: new Date().toISOString(),
      createdAt:
        posts.find((p) => p.id === postId)?.createdAt ||
        new Date().toISOString(),
    };

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPost),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update blog post");
      }

      updatePost(updatedPost);
      setSuccess("Blog post updated successfully!");
      setTimeout(() => {
        router.push("/blogs/list");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating blog post:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const editBlogConfig: FormConfig = {
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
    ],
    onSubmit: handleSubmit,
    submitLabel: isLoading ? "Updating..." : "Update Post",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl px-10 py-12">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
          📝 Edit Blog Post
        </h1>

        {isLoading && (
          <div className="text-center text-blue-600 mb-4">Updating post...</div>
        )}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {success}</span>
          </div>
        )}

        {!error && <GenericForm {...editBlogConfig} className="space-y-6" />}
      </div>
    </div>
  );
};

export default EditBlog;
