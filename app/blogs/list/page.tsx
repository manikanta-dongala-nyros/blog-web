"use client";

import { useEffect } from "react";
import { useBlogStore } from "@/stores/blogStore";
import { format } from "date-fns";
import Link from "next/link";

const BlogList = () => {
  const posts = useBlogStore((state) => state.posts);
  const isLoading = useBlogStore((state) => state.isLoading);
  const fetchPosts = useBlogStore((state) => state.fetchPosts);
  const deletePost = useBlogStore((state) => state.deletePost);
  console.log({ posts });

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    // <div className="max-w-6xl mx-auto px-4 py-8">
    //   <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
    //     Blog Posts
    //   </h1>

    //   <div className="flex justify-end mb-4">
    //     <Link
    //       href="/blogs/create"
    //       className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
    //     >
    //       Create Post
    //     </Link>
    //   </div>

    //   {isLoading ? (
    //     <p className="text-center text-gray-500">Loading posts...</p>
    //   ) : posts.length === 0 ? (
    //     <p className="text-center text-gray-500">No blog posts found.</p>
    //   ) : (
    //     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    //       {posts.map((post) => (
    //         <div
    //           key={post.id}
    //           className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
    //         >
    //           <div>
    //             <h2 className="text-xl font-semibold text-gray-900 mb-2">
    //               {post.title}
    //             </h2>
    //             <p className="text-sm text-gray-500 mb-1">
    //               By <span className="font-medium">{post.author}</span> •{" "}
    //               {format(new Date(post.createdAt), "PPP")}
    //             </p>

    //             {post.tags && post.tags.length > 0 && (
    //               <div className="mt-2 flex flex-wrap gap-2">
    //                 {post.tags.map((tag, idx) => (
    //                   <span
    //                     key={idx}
    //                     className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full"
    //                   >
    //                     #{tag}
    //                   </span>
    //                 ))}
    //               </div>
    //             )}

    //             <p className="mt-4 text-gray-700 line-clamp-3">
    //               {post.content}
    //             </p>
    //           </div>

    //           <div className="mt-6 flex justify-end space-x-4">
    //             <Link
    //               href={`/blogs/edit/${post.id}`}
    //               className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
    //             >
    //               Edit
    //             </Link>
    //             <button
    //               onClick={() => deletePost(post.id)}
    //               className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
    //             >
    //               Delete
    //             </button>
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   )}
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-12 tracking-tight">
          📰 Blog Posts
        </h1>

        <div className="flex justify-end mb-8">
          <Link
            href="/blogs/create"
            className="text-sm bg-green-500 text-white px-6 py-2.5 rounded-full shadow-md hover:bg-green-600 transition-all duration-200"
          >
            + Create Post
          </Link>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">⏳ Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">🚫 No blog posts found.</p>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 shadow-sm hover:shadow-lg rounded-2xl p-6 transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">
                    ✍️ <span className="font-medium">{post.author}</span> •{" "}
                    {format(new Date(post.createdAt), "PPP")}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-4 text-gray-700 text-sm line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <Link
                    href={`/blogs/edit/${post.id}`}
                    className="text-xs bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-xs bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
