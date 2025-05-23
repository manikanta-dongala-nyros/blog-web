"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation";
import { useBlogStore } from "@/stores/blogStore";
import Swal from "sweetalert2";
import GenericForm from "@/components/common/GenericForm/GenericForm";
import { FormConfig } from "@/components/common/GenericForm/types";
import NavBar from "@/components/common/GenericForm/Navbar";
import useAuthStore from "@/stores/authStore";

const CreateBlog = () => {
  const router = useRouter();
  const addPost = useBlogStore((state) => state.addPost);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // Effect to check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Initialize form data from localStorage or default values
  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedFormData = localStorage.getItem('createBlogFormData');
      if (savedFormData) {
        return JSON.parse(savedFormData);
      }
    }
    return {
      title: "",
      content: "",
      author: user?.username || "Unknown",
      tags: "",
      published: false,
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('createBlogFormData', JSON.stringify(formData));
    }
  }, [formData]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("content", values.content);
    formData.append("author", values.author);
    formData.append("tags", values.tags);
    formData.append("published", values.published);
    if (values.image) {
      formData.append("file", values.image);
    }

    try {
      const response = await fetch("/api/blog/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create blog post");
      }

      const createdPost = await response.json();
      addPost({
        ...createdPost,
        id: createdPost._id?.toString() || createdPost.id,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Blog post created successfully!",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        router.push("/blogs/list");
      });

      // Clear form data from localStorage after successful submission
      localStorage.removeItem('createBlogFormData');
      setFormData({
        title: "",
        content: "",
        author: "",
        tags: "",
        published: false,
      });
    } catch (error) {
      console.error("Error creating blog post:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create blog post.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBlogConfig: FormConfig = {
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        required: true,
        // maxLength: 100, // valid
      },
      {
        name: "author",
        label: "Author",
        type: "text",
        required: true,
        defaultValue: user?.username || "", // Set default value from user store
        disabled: !!user?.username, // Optionally disable if user is logged in
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
      {
        name: "image",
        label: "Featured Image",
        type: "file",
        accept: "image/*",
      },
    ],
    onSubmit: handleSubmit,
    submitLabel: loading ? "Creating..." : "Create Post",
    // resetLabel: "Reset Form",
  };

  return (
    <>
      <NavBar />
      {/* Only render content if authenticated */}
      {isAuthenticated && (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl px-10 py-12">
            {/* Breadcrumb */}
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
              / <span className="font-semibold text-gray-700">Create</span>
            </nav>

            {/* Title */}
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
              📝 Create New Blog Post
            </h1>

            {/* Form */}
            <GenericForm {...createBlogConfig} className="space-y-6" />

            {/* Navigation */}
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
      )}
    </>
  );
};

export default CreateBlog;
