"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/common/GenericForm/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import useAuthStore from "@/stores/authStore";

const HomePage = () => {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
        <NavBar />

        {/* Hero Section */}
        <header className="flex-grow flex flex-col justify-center items-center text-center px-4 md:px-0 max-w-4xl mx-auto mt-16">
          <h1 className="text-5xl font-extrabold text-blue-800 mb-6 leading-tight">
            Welcome to <span className="text-blue-600">MyBlogApp</span>
          </h1>
          <p className="text-lg text-gray-700 max-w-xl mb-10">
            Explore the latest trending posts, insightful blogs, connect with
            users, and save your favorite content — all in one place.
          </p>

          <button
            onClick={() => router.push("/blogs/list")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition"
          >
            Browse Blogs
          </button>
        </header>

        {/* Footer */}
        <footer className="bg-white mt-auto py-6 shadow-inner text-center text-gray-600">
          &copy; {new Date().getFullYear()} MyBlogApp. All rights reserved.
        </footer>
      </div>
    </ProtectedRoute>
  );
};

export default HomePage;
