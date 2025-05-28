"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBlogStore } from "@/stores/blogStore";
import GenericForm from "@/components/common/GenericForm/GenericForm";
import NavBar from "@/components/common/GenericForm/Navbar"; // Ensure this Navbar is themed for a light background
import Swal from "sweetalert2";
import { FaSpinner, FaExclamationCircle, FaArrowLeft } from "react-icons/fa"; // Added FaArrowLeft for back button

const EditBlog = () => {
  const router = useRouter();
  const { id } = useParams();
  const postId = Array.isArray(id) ? id[0] : id;

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // Renamed 'loading' to 'formSubmitting' for clarity, as useBlogStore also has 'isLoading'
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // Renamed 'error' for clarity

  const {
    selectedPost,
    fetchPost,
    updatePost,
    isLoading: postLoading,
  } = useBlogStore(); // isLoading from store is for fetching

  const imagePreviewUrl = selectedPost?.imageId
    ? `/api/image/${selectedPost.imageId}`
    : null;

  // Memoize initialValues to prevent re-renders of GenericForm if selectedPost data hasn't changed meaningfully
  const initialValues = useCallback(() => {
    if (!selectedPost) {
      return {
        title: "",
        author: "",
        content: "",
        tags: "",
        published: false,
        image: null as File | null,
        imageId: "",
        imageMimeType: "",
      };
    }
    return {
      title: selectedPost.title || "",
      author: selectedPost.author || "",
      content: selectedPost.content || "",
      tags: Array.isArray(selectedPost.tags)
        ? selectedPost.tags
            .filter((tag) => typeof tag === "string" && tag.trim() !== "")
            .join(", ")
        : "",
      published: !!selectedPost.published,
      image: null as File | null,
      imageId: selectedPost.imageId || "",
      imageMimeType: selectedPost.imageMimeType || "",
    };
  }, [selectedPost]);

  useEffect(() => {
    let mounted = true;

    const loadPost = async () => {
      if (!postId) return;
      // Reset form error when loading a new post
      if (mounted) setFormError(null);
      try {
        await fetchPost(postId);
      } catch (err) {
        if (mounted) {
          setFormError(
            "Failed to load blog post details. Please try again later."
          );
          console.error(err);
        }
      }
    };

    loadPost();

    return () => {
      mounted = false;
    };
  }, [postId, fetchPost]);

  const showThemedSwal = (options: any) => {
    Swal.fire({
      background: "#ffffff", // Light background for the alert
      color: "#1f2937", // Dark text color (slate-800)
      confirmButtonColor: "#0ea5e9", // Sky-500 for confirm button
      cancelButtonColor: "#9ca3af", // Gray-400 for cancel button
      ...options,
    });
  };

  const handleSubmit = useCallback(
    async (values: any) => {
      setFormSubmitting(true);
      setFormError(null);

      try {
        const form = new FormData();

        form.append("title", values.title);
        form.append("author", values.author);
        form.append("content", values.content);
        // Ensure tags are handled correctly, especially if empty
        form.append("tags", values.tags || "");
        form.append("published", values.published ? "true" : "false");
        form.append("id", postId!);
        
        // Preserve likes data if it exists
        if (selectedPost?.likes) {
          form.append("likes", JSON.stringify(selectedPost.likes));
        }

        if (values.image) {
          if (values.image.size > 5 * 1024 * 1024) {
            // 5MB limit
            throw new Error("Image size must be less than 5MB.");
          }
          form.append("image", values.image);
        }

        const response = await fetch("/api/blog/update", {
          method: "PUT",
          body: form,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              "Failed to update blog post. The server returned an error."
          );
        }

        const updatedPostData = await response.json();

        // Normalize post data structure for the store
        const normalizedPost = {
          ...updatedPostData,
          id: updatedPostData._id || updatedPostData.id, // Handle _id from MongoDB
          tags: updatedPostData.tags || [],
        };

        await updatePost(normalizedPost); // Update store

        showThemedSwal({
          icon: "success",
          title: "Success!",
          text: "Blog post updated successfully!",
          timer: 1500,
          showConfirmButton: false,
        });

        router.push("/blogs/list");
      } catch (err: any) {
        const errorMessage =
          err.message ||
          "An unexpected error occurred while updating the post.";
        setFormError(errorMessage);
        showThemedSwal({
          icon: "error",
          title: "Update Failed",
          text: errorMessage,
        });
        console.error(err);
      } finally {
        setFormSubmitting(false);
      }
    },
    [postId, updatePost, router, selectedPost] // Add selectedPost to dependencies
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic client-side validation for image type (optional, server should validate too)
      if (!file.type.startsWith("image/")) {
        setFormError("Invalid file type. Please select an image.");
        showThemedSwal({
          icon: "error",
          title: "Invalid File",
          text: "Please select an image file (e.g., JPG, PNG, GIF).",
        });
        event.target.value = ""; // Clear the input
        return;
      }
      // Preview logic
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormError(null); // Clear previous file errors
    } else {
      setPreviewImage(null);
    }
  };

  const editBlogConfig = {
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        required: true,
        placeholder: "Enter blog title",
      },
      {
        name: "author",
        label: "Author",
        type: "text",
        required: true,
        placeholder: "Enter author's name",
      },
      {
        name: "content",
        label: "Content",
        type: "textarea",
        required: true,
        rows: 8,
        placeholder: "Write your blog content here...",
      },
      {
        name: "tags",
        label: "Tags (comma-separated)",
        type: "text",
        placeholder: "e.g., tech, programming, javascript",
      },
      {
        name: "published",
        label: "Publish Post",
        type: "checkbox",
        info: "Check this box to make the post publicly visible.",
      },
      {
        name: "image",
        label: "Featured Image",
        type: "file",
        accept: "image/*",
        onChange: handleImageChange,
        info: "Max 5MB. Recommended aspect ratio 16:9.",
      },
    ],
    onSubmit: handleSubmit,
    submitLabel: formSubmitting ? "Updating..." : "Update Post",
    // Assuming GenericForm can take this prop for styling its submit button
    submitButtonClassName: `w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50 ${
      formSubmitting ? "opacity-70 cursor-not-allowed" : ""
    }`,
    // Assuming GenericForm can take these for styling individual fields
    fieldContainerClassName: "mb-6",
    labelClassName: "block text-sm font-medium text-slate-700 mb-1",
    inputClassName:
      "block w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm placeholder-slate-400",
    textareaClassName:
      "block w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm placeholder-slate-400 min-h-[120px]",
    checkboxLabelClassName: "ml-2 text-sm text-slate-700",
    checkboxContainerClassName: "flex items-center mt-1",
    fileInputClassName:
      "block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-colors",
    infoClassName: "mt-1 text-xs text-slate-500",
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <nav className="text-sm text-slate-500 mb-6 flex items-center">
            <span
              className="cursor-pointer hover:text-sky-600 transition-colors"
              onClick={() => router.push("/")}
            >
              Home
            </span>
            <span className="mx-2">/</span>
            <span
              className="cursor-pointer hover:text-sky-600 transition-colors"
              onClick={() => router.push("/blogs/list")}
            >
              Blogs
            </span>
            <span className="mx-2">/</span>
            <span className="font-semibold text-slate-700">Edit Post</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-800 mb-8 tracking-tight">
            📝 Edit Blog Post
          </h1>

          {/* Display form submission status/error */}
          {formSubmitting && (
            <div className="text-center text-sky-600 mb-4 p-3 bg-sky-50 border border-sky-200 rounded-md flex items-center justify-center">
              <FaSpinner className="animate-spin mr-2" /> Submitting changes...
            </div>
          )}
          {formError && (
            <div className="text-center text-red-600 mb-4 p-3 bg-red-50 border border-red-300 rounded-md flex items-center justify-center">
              <FaExclamationCircle className="mr-2" /> {formError}
            </div>
          )}

          {/* Display initial post loading status or form */}
          {postLoading && !selectedPost ? ( // Show loading if postLoading is true AND selectedPost is not yet available
            <div className="flex flex-col items-center justify-center text-slate-600 py-16">
              <FaSpinner className="animate-spin text-5xl mb-4 text-sky-500" />
              <p className="text-xl">Loading post details...</p>
            </div>
          ) : !postLoading &&
            !selectedPost &&
            postId &&
            formError /* Error from fetchPost */ ? (
            <div className="text-center text-red-600 py-16">
              <FaExclamationCircle className="text-7xl mx-auto mb-6 text-red-400" />
              <p className="text-2xl font-semibold text-slate-700">
                Could not load post
              </p>
              <p className="text-slate-500 mt-2">{formError}</p>
            </div>
          ) : selectedPost && selectedPost.id === postId ? (
            <>
              <GenericForm
                {...editBlogConfig}
                initialValues={initialValues()} // Call memoized function
                className="space-y-0" // GenericForm config now handles field spacing via fieldContainerClassName
              />

              {(previewImage || imagePreviewUrl) && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-2 text-center">
                    {previewImage
                      ? "New Featured Image Preview:"
                      : "Current Featured Image:"}
                  </p>
                  <div className="flex justify-center">
                    <img
                      src={previewImage || imagePreviewUrl!}
                      alt="Featured"
                      className="rounded-lg border border-slate-200 shadow-sm max-h-72 object-contain bg-slate-50"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            // Fallback for unexpected state, or if postId is missing initially
            <div className="flex flex-col items-center justify-center text-slate-500 py-16">
              <FaExclamationCircle className="text-5xl mb-4 text-slate-400" />
              <p className="text-xl">Post not found or ID is missing.</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <button
              onClick={() => router.push("/blogs/list")}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <FaArrowLeft /> Back to Blog List
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditBlog;
