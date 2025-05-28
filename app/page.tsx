// "use client";

// import { useRouter } from "next/navigation";
// import NavBar from "@/components/common/GenericForm/Navbar";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import useAuthStore from "@/stores/authStore";

// const HomePage = () => {
//   const router = useRouter();

//   return (
//     <ProtectedRoute>
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
//         <NavBar />

//         {/* Hero Section */}
//         <header className="flex-grow flex flex-col justify-center items-center text-center px-4 md:px-0 max-w-4xl mx-auto mt-16">
//           <h1 className="text-5xl font-extrabold text-blue-800 mb-6 leading-tight">
//             Welcome to <span className="text-blue-600">MyBlogApp</span>
//           </h1>
//           <p className="text-lg text-gray-700 max-w-xl mb-10">
//             Explore the latest trending posts, insightful blogs, connect with
//             users, and save your favorite content — all in one place.
//           </p>

//           <button
//             onClick={() => router.push("/blogs/list")}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition"
//           >
//             Browse Blogs
//           </button>
//         </header>

//         {/* Footer */}
//         <footer className="bg-white mt-auto py-6 shadow-inner text-center text-gray-600">
//           &copy; {new Date().getFullYear()} MyBlogApp. All rights reserved.
//         </footer>
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default HomePage;

"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/common/GenericForm/Navbar"; // Assuming this is styled or you'll style it
import ProtectedRoute from "@/components/ProtectedRoute";
// Removed useAuthStore as it wasn't used directly in this component's render logic
// import useAuthStore from "@/stores/authStore";

const HomePage = () => {
  const router = useRouter();

  return (
    <ProtectedRoute>
      {/* Main container with the cool gray gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 flex flex-col text-slate-100 overflow-hidden">
        <NavBar />

        {/* Hero Section */}
        <main className="flex-grow flex flex-col justify-center items-center text-center px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            {/* Optional: A subtle decorative element */}
            {/* <SparklesIcon className="w-16 h-16 text-sky-500 mx-auto mb-4 opacity-70" /> */}

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-8 leading-tight">
              <span className="block text-slate-200">Welcome to</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 mt-2 animate-pulse-slow">
                MyBlogApp
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed">
              Explore trending posts, insightful blogs, connect with users, and
              save your favorite content — all in one radiant place.
            </p>

            <button
              onClick={() => router.push("/blogs/list")}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold px-10 py-4 rounded-lg shadow-xl shadow-sky-500/30 hover:shadow-sky-400/40 transition-all duration-300 transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50"
            >
              Discover Blogs
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900/60 backdrop-blur-sm mt-auto py-8 border-t border-slate-700/50 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} MyBlogApp. All rights reserved.
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Crafted with 🩶 by YourName/Team
          </p>
        </footer>
      </div>
    </ProtectedRoute>
  );
};

export default HomePage;
