// "use client";

// import { useState, useEffect, use } from "react";
// import { useRouter } from "next/navigation";
// import { useBlogStore } from "@/stores/blogStore";
// import { BlogPost } from "@/types/blog";
// import GenericForm from "@/components/common/GenericForm/GenericForm";
// import { FormConfig } from "@/components/common/GenericForm/types";
// import Swal from "sweetalert2";
// import NavBar from "@/components/common/GenericForm/Navbar";
// import { useAuthStore } from "@/stores/authStore"; // Import useAuthStore

// const EditBlog = ({ params }: { params: { id: string } }) => {
//   const router = useRouter();
//   const updatePost = useBlogStore((state) => state.updatePost);
//   const posts = useBlogStore((state) => state.posts);
//   const selectedPost = useBlogStore((state) => state.selectedPost);
//   const fetchPost = useBlogStore((state) => state.fetchPost);
//   const clearSelectedPost = useBlogStore((state) => state.clearSelectedPost);
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Get auth state

//   const postId = params.id;

//   const [formData, setFormData] = useState({
//     title: "",
//     content: "",
//     author: "",
//     tags: "",
//     published: false,
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Effect to check authentication status
//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push("/login"); // Redirect to login if not authenticated
//     }
//   }, [isAuthenticated, router]); // Depend on isAuthenticated and router

//   useEffect(() => {
//     // Fetch the post if it's not already selected or if the selected post doesn't match the current ID
//     if (!selectedPost || selectedPost.id !== postId) {
//       fetchPost(postId).then(() => {
//         // After fetching, get the latest selectedPost from the store
//         const post = useBlogStore.getState().selectedPost;
//         if (post && post.id === postId) {
//           setFormData({
//             title: post.title,
//             content: post.content,
//             author: post.author,
//             tags: post.tags?.join(", ") || "",
//             published: post.published,
//           });
//           setError(null);
//         }
//       });
//     } else {
//       setFormData({
//         title: selectedPost.title,
//         content: selectedPost.content,
//         author: selectedPost.author,
//         tags: selectedPost.tags?.join(", ") || "",
//         published: selectedPost.published,
//       });
//       setError(null);
//     }
//   }, [postId, selectedPost, fetchPost]); // Add fetchPost to dependencies

//   // Optional: Clear selected post when component unmounts
//   useEffect(() => {
//     return () => {
//       clearSelectedPost();
//     };
//   }, [clearSelectedPost]);

//   const handleSubmit = async (values: any) => {
//     const formData = new FormData();
//     formData.append("id", postId);
//     formData.append("title", values.title);
//     formData.append("content", values.content);
//     formData.append("author", values.author);
//     formData.append("tags", values.tags);
//     formData.append("published", values.published);
//     if (values.image) {
//       formData.append("file", values.image);
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch("/api/blog/update", {
//         method: "PUT",
//         body: formData,
//       });

//       const postToUpdate: BlogPost = {
//         id: postId,
//         title: values.title,
//         slug: (values.title || "").toLowerCase().replace(/\s+/g, "-"),
//         content: values.content,
//         author: values.author,
//         tags: (values.tags || "")
//           .split(",")
//           .map((tag: string) => tag.trim())
//           .filter((tag: string) => tag !== ""),
//         published: values.published,
//         updatedAt: new Date().toISOString(),
//         // Use the createdAt from the fetched selectedPost
//         createdAt: selectedPost?.createdAt || new Date().toISOString(),
//       };

//       await updatePost(postToUpdate);
//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Blog post updated successfully!",
//         timer: 1500,
//         showConfirmButton: false,
//       }).then(() => {
//         router.push("/blogs/list");
//       });
//     } catch (err: any) {
//       console.error(
//         "Error caught in component after store update attempt:",
//         err
//       );
//       setError(err.message || "An unexpected error occurred while updating.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const editBlogConfig: FormConfig = {
//     fields: [
//       {
//         name: "title",
//         label: "Title",
//         type: "text",
//         required: true,
//       },
//       {
//         name: "author",
//         label: "Author",
//         type: "text",
//         required: true,
//       },
//       {
//         name: "content",
//         label: "Content",
//         type: "textarea",
//         required: true,
//       },
//       {
//         name: "tags",
//         label: "Tags (comma-separated)",
//         type: "text",
//       },
//       {
//         name: "published",
//         label: "Published",
//         type: "checkbox",
//       },
//       {
//         name: "image",
//         label: "Featured Image",
//         type: "file",
//       },
//     ],
//     onSubmit: handleSubmit,
//     submitLabel: isLoading ? "Updating..." : "Update Post",
//   };

//   return (
//     <>
//       <NavBar />
//       {/* Only render content if authenticated */}
//       {isAuthenticated && (
//         <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl px-10 py-12">
//             <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
//               📝 Edit Blog Post
//             </h1>

//             {isLoading && (
//               <div className="text-center text-blue-600 mb-4">
//                 Updating post...
//               </div>
//             )}

//             {/* Show form only when selectedPost is loaded and matches the current ID */}
//             {selectedPost && selectedPost.id === postId && !error ? (
//               <GenericForm
//                 {...editBlogConfig}
//                 initialValues={formData}
//                 className="space-y-6"
//               />
//             ) : (
//               // Show loading or error message if post is not loaded
//               !error && (
//                 <p className="text-center text-gray-500">Loading post...</p>
//               )
//             )}

//             {error && (
//               <div className="text-center text-red-600 mb-4">
//                 Error: {error}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default EditBlog;

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBlogStore } from "@/stores/blogStore";
import { BlogPost } from "@/types/blog";
import GenericForm from "@/components/common/GenericForm/GenericForm";
import { FormConfig } from "@/components/common/GenericForm/types";
import Swal from "sweetalert2";
import NavBar from "@/components/common/GenericForm/Navbar";
import { useAuthStore } from "@/stores/authStore";

const EditBlog = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const postId = params.id;

  // Store hooks
  const { updatePost, posts, selectedPost, fetchPost, clearSelectedPost } =
    useBlogStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // State management
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    tags: "",
    published: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch and set post data
  useEffect(() => {
    const loadPostData = async () => {
      try {
        if (!selectedPost || selectedPost.id !== postId) {
          await fetchPost(postId);
        }

        const currentPost =
          selectedPost?.id === postId
            ? selectedPost
            : useBlogStore.getState().selectedPost;

        if (currentPost?.id === postId) {
          setFormData({
            title: currentPost.title,
            content: currentPost.content,
            author: currentPost.author,
            tags: currentPost.tags?.join(", ") || "",
            published: currentPost.published,
          });
          setError(null);
        }
      } catch (err) {
        setError("Failed to load post data");
        console.error("Error loading post:", err);
      }
    };

    loadPostData();
  }, [postId, selectedPost, fetchPost]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      clearSelectedPost();
    };
  }, [clearSelectedPost]);

  // Form submission handler
  const handleSubmit = useCallback(
    async (values: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("id", postId);
        formData.append("title", values.title);
        formData.append("content", values.content);
        formData.append("author", values.author);
        formData.append("tags", values.tags);
        formData.append("published", String(values.published));
        if (values.image) {
          formData.append("file", values.image);
        }

        const response = await fetch("/api/blog/update", {
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
      } finally {
        setIsLoading(false);
      }
    },
    [postId, selectedPost, updatePost, router]
  );

  // Form configuration
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
        },
      ],
      onSubmit: handleSubmit,
      submitLabel: isLoading ? "Updating..." : "Update Post",
    }),
    [handleSubmit, isLoading]
  );

  if (!isAuthenticated) {
    return null; // Early return if not authenticated
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl px-10 py-12">
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
        </div>
      </div>
    </>
  );
};

export default EditBlog;
