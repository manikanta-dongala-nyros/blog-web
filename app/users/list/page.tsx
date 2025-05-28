// "use client";

// import { useEffect } from "react";
// import { useUserStore } from "@/stores/userStore";
// import { format } from "date-fns";
// import { FaUsers, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
// import NavBar from "@/components/common/GenericForm/Navbar";
// import useAuthStore from "@/stores/authStore";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// const UserList = () => {
//   const { users, isLoading, error, fetchUsers } = useUserStore();
//   const { isAuthenticated, hasHydrated } = useAuthStore();
//   const router = useRouter();

//   useEffect(() => {
//     if (hasHydrated && !isAuthenticated) {
//       router.push("/login");
//       return;
//     }
//     fetchUsers();
//   }, [hasHydrated, isAuthenticated, fetchUsers, router]);

//   if (!hasHydrated) {
//     return <div className="p-8 text-center">🔄 Authenticating...</div>;
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

//   return (
//     <>
//       <NavBar />
//       <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 px-4 py-12 overflow-hidden">
//         <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg p-8">
//           <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-12 tracking-tight">
//             👥 Users
//           </h1>

//           {isLoading ? (
//             <p className="text-center text-gray-500">⏳ Loading users...</p>
//           ) : error ? (
//             <p className="text-center text-red-500">❌ Error: {error}</p>
//           ) : users.length === 0 ? (
//             <p className="text-center text-gray-500">No users found.</p>
//           ) : (
//             <div className="grid gap-6">
//               {users.map((user) => (
//                 <div
//                   key={user._id}
//                   className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-2xl"
//                 >
//                   <div className="p-6 flex items-center justify-between">
//                     <div>
//                       <Link
//                         href={`/users/${user._id}`}
//                         className="hover:text-blue-600 transition-colors"
//                       >
//                         <h2 className="text-xl font-semibold text-gray-800">
//                           {user.username}
//                         </h2>
//                       </Link>
//                       <p className="text-gray-600">{user.email}</p>
//                       <p className="text-sm text-gray-500">
//                         Joined {format(new Date(user.createdAt), "PPP")}
//                       </p>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <span
//                         className={`px-3 py-1 rounded-full text-sm ${
//                           user.isVerified
//                             ? "bg-green-100 text-green-800"
//                             : "bg-yellow-100 text-yellow-800"
//                         }`}
//                       >
//                         {user.isVerified ? (
//                           <FaCheckCircle className="text-sm" />
//                         ) : (
//                           <FaExclamationTriangle className="text-sm" />
//                         )}
//                         {user.isVerified ? "✓ Verified" : "⚠ Unverified"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default UserList;

"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { format } from "date-fns";
import {
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import NavBar from "@/components/common/GenericForm/Navbar"; // Assuming this is styled or you'll style it separately
import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

const UserList = () => {
  const { users, isLoading, error, fetchUsers } = useUserStore();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      // Fetch users only if authenticated
      fetchUsers();
    }
  }, [hasHydrated, isAuthenticated, fetchUsers, router]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-300">
        <FaSpinner className="animate-spin text-4xl mr-3" />
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) {
    // This typically shouldn't be reached if router.push works, but good as a fallback
    return null;
  }

  return (
    <>
      <NavBar />
      {/* Cool Gray Background - Darker Theme */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 px-4 py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 pb-2">
              User Management
            </h1>
            <p className="text-lg text-slate-400 mt-2">
              Oversee and manage all registered users.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-slate-400 h-64">
              <FaSpinner className="animate-spin text-5xl mb-4 text-sky-500" />
              <p className="text-xl">Loading users, please wait...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-6 py-4 rounded-lg text-center">
              <FaExclamationTriangle className="text-3xl mx-auto mb-2 text-red-400" />
              <p className="font-semibold">Error loading users:</p>
              <p>{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <FaUsers className="text-6xl mx-auto mb-4 text-slate-600" />
              <p className="text-xl">No users found at the moment.</p>
              <p className="text-sm mt-1">
                Check back later or try adding new users.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl shadow-black/30 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-sky-500/20 border border-slate-700"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Link href={`/users/${user._id}`} className="group">
                        <h2
                          className="text-2xl font-bold text-slate-100 group-hover:text-sky-400 transition-colors duration-300 truncate"
                          title={user.username}
                        >
                          {user.username}
                        </h2>
                      </Link>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide
                          ${
                            user.isVerified
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                          }`}
                      >
                        {user.isVerified ? (
                          <FaCheckCircle className="mr-1.5 text-sm" />
                        ) : (
                          <FaExclamationTriangle className="mr-1.5 text-sm" />
                        )}
                        {user.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                    <p
                      className="text-slate-400 text-sm mb-1 truncate"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      Joined:{" "}
                      {format(
                        new Date(user.createdAt),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                  {/* Optional: Add a subtle footer or action area inside the card */}
                  {/* <div className="px-6 py-3 bg-slate-700/50 border-t border-slate-700 text-right">
                        <Link href={`/users/${user._id}`} className="text-sm text-sky-400 hover:text-sky-300 font-medium">
                            View Details →
                        </Link>
                    </div> */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserList;
