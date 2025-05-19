"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBlogStore } from "@/stores/blogStore";
import { BlogPost } from "@/types/blog";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";
import GenericForm from "@/components/common/GenericForm/GenericForm";
import { FormConfig } from "@/components/common/GenericForm/types";

const CreateBlog = () => {
  const router = useRouter();
  const addPost = useBlogStore((state) => state.addPost);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    tags: "",
    published: false,
  });

  const handleSubmit = async (values: any) => {
    const newPost: BlogPost = {
      id: uuidv4(),
      title: values.title,
      slug: values.title.toLowerCase().replace(/\s+/g, "-"),
      content: values.content,
      author: values.author,
      tags: values.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag !== ""),
      published: values.published,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/blog/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error("Failed to create blog post");
      }

      addPost(newPost);
      setFormData({
        title: "",
        content: "",
        author: "",
        tags: "",
        published: false,
      });
      toast.success("Blog post created successfully!");
      router.push("/blogs/list"); // Redirect to list page after successful creation
    } catch (error) {
      console.error("Error creating blog post:", error);
      toast.error("Failed to create blog post.");
    }
  };

  const createBlogConfig: FormConfig = {
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
        label: "Publish immediately",
        type: "checkbox",
      },
    ],
    onSubmit: handleSubmit,
    submitLabel: "Create Post",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl px-10 py-12">
        <Toaster />
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
          📝 Create New Blog Post
        </h1>

        <GenericForm {...createBlogConfig} className="space-y-6" />
      </div>
    </div>
  );
};

export default CreateBlog;
