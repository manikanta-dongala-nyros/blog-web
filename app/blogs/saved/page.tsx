// "use client";

// import { useEffect } from "react";
// import Link from "next/link";
// import Swal, { SweetAlertResult } from "sweetalert2";
// import NavBar from "@/components/common/GenericForm/Navbar";
// import { useRouter } from "next/navigation";
// import useAuthStore from "@/stores/authStore";
// import { getCookie } from "cookies-next";
// import { FaSpinner, FaExclamationCircle } from "react-icons/fa";
// import { useSavedBlogsStore } from "@/stores/savedPostStore";
// import type { BlogPost } from "@/types/blog";
// import BlogCard from "@/components/common/BlogCard"; // Adjust path if BlogCard is in src/app/blogs/BlogCard.tsx
// import type {
//   Post as BlogCardPostType,
//   StoreActionPost as BlogCardStoreActionPostType,
// } from "@/components/common/BlogCard"; // Adjust path if BlogCard types are from src/app/blogs/BlogCard.tsx

// const SavedBlogsPage = () => {
//   const { posts: savedBlogPosts, isLoading, fetchPosts } = useSavedBlogsStore();

//   const { isAuthenticated, hydrate, isLoading: authIsLoading } = useAuthStore();
//   const router = useRouter();
//   const currentUserId = String(getCookie("userId") || "");

//   useEffect(() => {
//     hydrate();
//   }, [hydrate]);

//   useEffect(() => {
//     if (!authIsLoading && !isAuthenticated) {
//       router.push("/login");
//     }
//   }, [authIsLoading, isAuthenticated, router]);

//   useEffect(() => {
//     if (
//       !authIsLoading &&
//       isAuthenticated &&
//       currentUserId &&
//       currentUserId !== "undefined" &&
//       currentUserId !== "null"
//     ) {
//       fetchPosts(currentUserId);
//     }
//   }, [authIsLoading, isAuthenticated, currentUserId, fetchPosts]);

//   const showThemedSwal = (options: any): Promise<SweetAlertResult<any>> => {
//     return Swal.fire({
//       background: "#ffffff",
//       color: "#1f2937",
//       confirmButtonColor: "#0ea5e9",
//       cancelButtonColor: "#9ca3af",
//       ...options,
//     });
//   };

//   const likePostApiCall = async (postId: string, userIdToLike: string) => {
//     try {
//       const res = await fetch("/api/blog/like", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ postId, userId: userIdToLike }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Like failed");
//       return data;
//     } catch (err: any) {
//       return { error: err.message };
//     }
//   };

//   const handleLikePost = async (postId: string) => {
//     if (
//       !currentUserId ||
//       currentUserId === "undefined" ||
//       currentUserId === "null"
//     ) {
//       showThemedSwal({
//         title: "Unauthorized",
//         text: "Please login to like posts.",
//         icon: "warning",
//       });
//       return;
//     }
//     const res = await likePostApiCall(postId, currentUserId);
//     if (res.error) {
//       showThemedSwal({ title: "Error", text: res.error, icon: "error" });
//       return;
//     }
//     if (
//       currentUserId &&
//       currentUserId !== "undefined" &&
//       currentUserId !== "null"
//     ) {
//       fetchPosts(currentUserId);
//     }
//   };

//   const handleUnsavePost = async (postId: string) => {
//     if (
//       !currentUserId ||
//       currentUserId === "undefined" ||
//       currentUserId === "null"
//     ) {
//       showThemedSwal({
//         title: "Unauthorized",
//         text: "Please login to unsave posts.",
//         icon: "warning",
//       });
//       return;
//     }

//     try {
//       const res = await fetch("/api/blog/save", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: currentUserId, postId }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to unsave post.");
//       showThemedSwal({
//         title: "Unsaved!",
//         text: "Post removed from your saved list.",
//         icon: "success",
//       });
//       if (
//         currentUserId &&
//         currentUserId !== "undefined" &&
//         currentUserId !== "null"
//       ) {
//         fetchPosts(currentUserId);
//       }
//     } catch (error: any) {
//       showThemedSwal({
//         title: "Error",
//         text: error.message || "An error occurred while unsaving.",
//         icon: "error",
//       });
//     }
//   };

//   const handleAttemptDeletePost = (postId: string) => {
//     showThemedSwal({
//       title: "Action Not Available Here",
//       text: "To delete this post from the system, please find it in the main blog list or your posts dashboard if you are the author.",
//       icon: "info",
//     });
//   };

//   const handleAttemptEditPost = (post: BlogCardStoreActionPostType) => {
//     showThemedSwal({
//       title: "Action Not Available Here",
//       text: `To edit "${post.title}", please find it in the main blog list or your posts dashboard.`,
//       icon: "info",
//       confirmButtonText: "Go to Edit Page",
//       showCancelButton: true,
//     }).then((result: SweetAlertResult<any>) => {
//       if (result.isConfirmed) {
//         router.push(`/blogs/edit/${post.id}`);
//       }
//     });
//   };

//   if (authIsLoading || (!isAuthenticated && !authIsLoading && !currentUserId)) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 flex items-center justify-center text-slate-700">
//         <FaSpinner className="animate-spin text-4xl mr-3 text-sky-500" />
//         Authenticating or Loading User Data...
//       </div>
//     );
//   }

//   if (
//     isAuthenticated &&
//     (!currentUserId ||
//       currentUserId === "undefined" ||
//       currentUserId === "null")
//   ) {
//     return (
//       <>
//         <NavBar />
//         <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 flex flex-col items-center justify-center text-slate-700">
//           <FaExclamationCircle className="text-4xl mr-3 text-amber-500 mb-4" />
//           <p className="text-xl">
//             User session active, but user ID is missing.
//           </p>
//           <p className="text-md text-slate-500">
//             Please try refreshing or logging out and back in.
//           </p>
//         </div>
//       </>
//     );
//   }

//   if (
//     isLoading &&
//     isAuthenticated &&
//     currentUserId &&
//     currentUserId !== "undefined" &&
//     currentUserId !== "null"
//   ) {
//     return (
//       <>
//         <NavBar />
//         <div className="flex flex-col items-center justify-center text-slate-600 h-screen-minus-navbar">
//           <FaSpinner className="animate-spin text-5xl mb-4 text-sky-500" />
//           <p className="text-xl">Loading your saved posts...</p>
//         </div>
//       </>
//     );
//   }

//   if (
//     !isLoading &&
//     savedBlogPosts.length === 0 &&
//     isAuthenticated &&
//     currentUserId &&
//     currentUserId !== "undefined" &&
//     currentUserId !== "null"
//   ) {
//     return (
//       <>
//         <NavBar />
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 px-4 py-12 flex flex-col items-center justify-center">
//           <div className="text-center text-slate-500 py-16">
//             <FaExclamationCircle className="text-7xl mx-auto mb-6 text-slate-400" />
//             <p className="text-2xl font-semibold text-slate-700">
//               You haven't saved any posts yet.
//             </p>
//             <p className="text-slate-500 mt-2">
//               Browse the blog and save posts you find interesting!
//             </p>
//             <Link
//               href="/blogs/list"
//               className="mt-6 inline-block px-6 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors"
//             >
//               Browse All Blogs
//             </Link>
//           </div>
//         </div>
//       </>
//     );
//   }

//   if (
//     !isAuthenticated ||
//     !currentUserId ||
//     currentUserId === "undefined" ||
//     currentUserId === "null"
//   ) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center text-slate-700">
//         <FaExclamationCircle className="text-4xl mr-3 text-amber-500" />
//         Please log in to see your saved blogs.
//       </div>
//     );
//   }

//   return (
//     <>
//       <NavBar />
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 px-4 py-12">
//         <div className="max-w-7xl mx-auto">
//           <div className="mb-16 text-center">
//             <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 pb-2">
//               Your Saved Blogs
//             </h1>
//             <p className="text-lg text-slate-600 mt-2">
//               Revisit your favorite articles and discoveries.
//             </p>
//           </div>

//           {savedBlogPosts.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {savedBlogPosts.map((blogPost: BlogPost) => {
//                 const cardPostData: BlogCardPostType = {
//                   id: blogPost.id,
//                   _id: blogPost?.id || blogPost.id,
//                   title: blogPost.title,
//                   slug: blogPost.slug || "",
//                   content: blogPost.content,
//                   author: blogPost?.author || "Unknown Author",
//                   userId: blogPost.userId,
//                   tags: blogPost.tags || [],
//                   published:
//                     blogPost.published !== undefined
//                       ? blogPost.published
//                       : true,
//                   createdAt: blogPost.createdAt,
//                   updatedAt: blogPost.updatedAt || blogPost.createdAt,
//                   imageId: blogPost.imageId,
//                   imageMimeType: blogPost.imageMimeType,
//                   likes: blogPost.likes || { likesCount: 0, likedBy: [] },
//                 };

//                 return (
//                   <BlogCard
//                     key={cardPostData.id}
//                     post={cardPostData}
//                     currentUserId={currentUserId}
//                     isAuthenticated={isAuthenticated}
//                     onLikePost={handleLikePost}
//                     onSavePost={handleUnsavePost} // This now correctly calls the unsave handler
//                     isInitiallySaved={true} // <<< Pass true because these are saved posts
//                     onDeletePost={handleAttemptDeletePost}
//                     onSelectPost={handleAttemptEditPost}
//                   />
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="text-center text-slate-500 py-16">
//               <FaExclamationCircle className="text-7xl mx-auto mb-6 text-slate-400" />
//               <p className="text-2xl font-semibold text-slate-700">
//                 No saved posts to display.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default SavedBlogsPage;

"use client";

import React, { useEffect, useState } from "react"; // Added useState
import Link from "next/link";
import Swal, { SweetAlertResult } from "sweetalert2";
import NavBar from "@/components/common/GenericForm/Navbar";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { getCookie } from "cookies-next";
import { FaSpinner, FaExclamationCircle } from "react-icons/fa";
import { useSavedBlogsStore } from "@/stores/savedPostStore";
import type { BlogPost } from "@/types/blog";
import BlogCard from "@/components/common/BlogCard";
import type {
  Post as BlogCardPostType,
  StoreActionPost as BlogCardStoreActionPostType,
} from "@/components/common/BlogCard";
import SearchBar from "@/components/common/SearchBar"; // <-- Import SearchBar

const SavedBlogsPage = () => {
  const { posts: savedBlogPosts, isLoading, fetchPosts } = useSavedBlogsStore();
  const { isAuthenticated, hydrate, isLoading: authIsLoading } = useAuthStore();
  const router = useRouter();
  const currentUserId = String(getCookie("userId") || "");

  const [searchQuery, setSearchQuery] = useState(""); // <-- State for search query

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    if (
      !authIsLoading &&
      isAuthenticated &&
      currentUserId &&
      currentUserId !== "undefined" &&
      currentUserId !== "null"
    ) {
      fetchPosts(currentUserId);
    }
  }, [authIsLoading, isAuthenticated, currentUserId, fetchPosts]);

  // Handler for the search bar
  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase()); // Store query in lowercase for case-insensitive search
  };

  // Filter saved posts based on search query
  // Searches title, author (if string), and tags
  const filteredSavedPosts = savedBlogPosts.filter((post) => {
    if (searchQuery === "") return true; // Show all if search is empty
    const query = searchQuery; // Already lowercase
    return (
      (post.title && post.title.toLowerCase().includes(query)) ||
      (post.author &&
        typeof post.author === "string" &&
        post.author.toLowerCase().includes(query)) ||
      (post.author &&
        typeof post.author === "object" &&
        (post.author as any).name &&
        (post.author as any).name.toLowerCase().includes(query)) || // If author is an object with a name
      (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  });

  const showThemedSwal = (options: any): Promise<SweetAlertResult<any>> => {
    return Swal.fire({
      background: "#ffffff",
      color: "#1f2937",
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#9ca3af",
      ...options,
    });
  };

  const likePostApiCall = async (postId: string, userIdToLike: string) => {
    // ... (likePostApiCall implementation - unchanged)
    try {
      const res = await fetch("/api/blog/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: userIdToLike }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Like failed");
      return data;
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const handleLikePost = async (postId: string) => {
    // ... (handleLikePost implementation - unchanged)
    if (
      !currentUserId ||
      currentUserId === "undefined" ||
      currentUserId === "null"
    ) {
      showThemedSwal({
        title: "Unauthorized",
        text: "Please login to like posts.",
        icon: "warning",
      });
      return;
    }
    const res = await likePostApiCall(postId, currentUserId);
    if (res.error) {
      showThemedSwal({ title: "Error", text: res.error, icon: "error" });
      return;
    }
    if (
      currentUserId &&
      currentUserId !== "undefined" &&
      currentUserId !== "null"
    ) {
      fetchPosts(currentUserId);
    }
  };

  const handleUnsavePost = async (postId: string) => {
    // ... (handleUnsavePost implementation - unchanged)
    if (
      !currentUserId ||
      currentUserId === "undefined" ||
      currentUserId === "null"
    ) {
      showThemedSwal({
        title: "Unauthorized",
        text: "Please login to unsave posts.",
        icon: "warning",
      });
      return;
    }

    try {
      const res = await fetch("/api/blog/save", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, postId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to unsave post.");
      showThemedSwal({
        title: "Unsaved!",
        text: "Post removed from your saved list.",
        icon: "success",
      });
      if (
        currentUserId &&
        currentUserId !== "undefined" &&
        currentUserId !== "null"
      ) {
        fetchPosts(currentUserId);
      }
    } catch (error: any) {
      showThemedSwal({
        title: "Error",
        text: error.message || "An error occurred while unsaving.",
        icon: "error",
      });
    }
  };

  const handleAttemptDeletePost = (postId: string) => {
    // ... (handleAttemptDeletePost implementation - unchanged)
    showThemedSwal({
      title: "Action Not Available Here",
      text: "To delete this post from the system, please find it in the main blog list or your posts dashboard if you are the author.",
      icon: "info",
    });
  };

  const handleAttemptEditPost = (post: BlogCardStoreActionPostType) => {
    // ... (handleAttemptEditPost implementation - unchanged)
    showThemedSwal({
      title: "Action Not Available Here",
      text: `To edit "${post.title}", please find it in the main blog list or your posts dashboard.`,
      icon: "info",
      confirmButtonText: "Go to Edit Page",
      showCancelButton: true,
    }).then((result: SweetAlertResult<any>) => {
      if (result.isConfirmed) {
        router.push(`/blogs/edit/${post.id}`);
      }
    });
  };

  // --- Loading and Auth States ---
  if (authIsLoading || (!isAuthenticated && !authIsLoading && !currentUserId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 flex items-center justify-center text-slate-700">
        <FaSpinner className="animate-spin text-4xl mr-3 text-sky-500" />
        Authenticating or Loading User Data...
      </div>
    );
  }

  if (
    isAuthenticated &&
    (!currentUserId ||
      currentUserId === "undefined" ||
      currentUserId === "null")
  ) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 flex flex-col items-center justify-center text-slate-700">
          <FaExclamationCircle className="text-4xl mr-3 text-amber-500 mb-4" />
          <p className="text-xl">
            User session active, but user ID is missing.
          </p>
          <p className="text-md text-slate-500">
            Please try refreshing or logging out and back in.
          </p>
        </div>
      </>
    );
  }

  if (
    isLoading && // Check isLoading from useSavedBlogsStore
    isAuthenticated &&
    currentUserId &&
    currentUserId !== "undefined" &&
    currentUserId !== "null"
  ) {
    return (
      <>
        <NavBar />
        <div className="flex flex-col items-center justify-center text-slate-600 h-screen-minus-navbar">
          <FaSpinner className="animate-spin text-5xl mb-4 text-sky-500" />
          <p className="text-xl">Loading your saved posts...</p>
        </div>
      </>
    );
  }

  // --- Handle "No Saved Posts At All" ---
  if (
    !isLoading && // Ensure not loading posts
    savedBlogPosts.length === 0 &&
    isAuthenticated && // Ensure user is authenticated
    currentUserId &&
    currentUserId !== "undefined" &&
    currentUserId !== "null"
  ) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 px-4 py-12 flex flex-col items-center justify-center">
          <div className="text-center text-slate-500 py-16">
            <FaExclamationCircle className="text-7xl mx-auto mb-6 text-slate-400" />
            <p className="text-2xl font-semibold text-slate-700">
              You haven't saved any posts yet.
            </p>
            <p className="text-slate-500 mt-2">
              Browse the blog and save posts you find interesting!
            </p>
            <Link
              href="/blogs/list"
              className="mt-6 inline-block px-6 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors"
            >
              Browse All Blogs
            </Link>
          </div>
        </div>
      </>
    );
  }

  // --- Handle "Not Authenticated" (should be caught earlier, but as a fallback) ---
  if (
    !isAuthenticated ||
    !currentUserId ||
    currentUserId === "undefined" ||
    currentUserId === "null"
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center text-slate-700">
        <FaExclamationCircle className="text-4xl mr-3 text-amber-500" />
        Please log in to see your saved blogs.
      </div>
    );
  }

  // --- Main Content Display ---
  // At this point, user is authenticated, data is loaded (or not if error), and savedBlogPosts might be > 0
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            {" "}
            {/* Reduced mb from 16 to 10 */}
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 pb-2">
              Your Saved Blogs
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Revisit your favorite articles and discoveries.
            </p>
          </div>

          {/* --- Search Bar --- */}
          {/* Only show SearchBar if there are posts to search (savedBlogPosts.length > 0) */}
          {savedBlogPosts.length > 0 && (
            <div className="mb-12 max-w-xl mx-auto">
              {" "}
              {/* Added more margin-bottom for spacing */}
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search saved titles, authors..."
              />
            </div>
          )}

          {/* --- Display Posts or "No Results" message --- */}
          {filteredSavedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSavedPosts.map((blogPost: BlogPost) => {
                // Map BlogPost to BlogCardPostType
                const cardPostData: BlogCardPostType = {
                  id: blogPost.id,
                  _id: blogPost?.id || blogPost.id,
                  title: blogPost.title,
                  slug: blogPost.slug || "",
                  content: blogPost.content,
                  // Ensure author is a string for BlogCard
                  author:
                    typeof blogPost.author === "string"
                      ? blogPost.author
                      : (blogPost.author as any)?.name || "Unknown Author",
                  userId: blogPost.userId,
                  tags: blogPost.tags || [],
                  published:
                    blogPost.published !== undefined
                      ? blogPost.published
                      : true,
                  createdAt: blogPost.createdAt,
                  updatedAt: blogPost.updatedAt || blogPost.createdAt,
                  imageId: blogPost.imageId,
                  imageMimeType: blogPost.imageMimeType,
                  likes: blogPost.likes || { likesCount: 0, likedBy: [] },
                };

                return (
                  <BlogCard
                    key={cardPostData.id}
                    post={cardPostData}
                    currentUserId={currentUserId}
                    isAuthenticated={isAuthenticated}
                    onLikePost={handleLikePost}
                    onSavePost={handleUnsavePost}
                    // isInitiallySaved={true}
                    onDeletePost={handleAttemptDeletePost}
                    onSelectPost={handleAttemptEditPost}
                  />
                );
              })}
            </div>
          ) : savedBlogPosts.length > 0 && searchQuery !== "" ? (
            // This case: There are saved posts, but the search yielded no results
            <div className="text-center text-slate-500 py-16">
              <FaExclamationCircle className="text-7xl mx-auto mb-6 text-slate-400" />
              <p className="text-2xl font-semibold text-slate-700">
                No saved posts match "{searchQuery}"
              </p>
              <p className="text-slate-500 mt-2">
                Try adjusting your search terms or clear the search.
              </p>
            </div>
          ) : // This case implies savedBlogPosts.length > 0, searchQuery is empty,
          // but somehow filteredSavedPosts is 0. This shouldn't happen if filter logic is correct.
          // If savedBlogPosts.length was 0, it would have been caught by the earlier "You haven't saved any posts yet" block.
          // This can be null or a fallback message if needed.
          // For safety, you could show a generic message or null.
          // If the "You haven't saved any posts yet" logic is robust, this block might not be strictly necessary
          // for the empty state, but only for the "no search results" state.
          null}
        </div>
      </div>
    </>
  );
};

export default SavedBlogsPage;
