"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import UpdateProfileForm from "@/components/auth/UpdateUsernameForm";

export default function MyAccountPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, setLastPath } = useAuthStore();

  useEffect(() => {
    // Save current path before potential redirect
    setLastPath("/myaccount");

    // Only redirect if not loading and not authenticated
    if (!isLoading && isAuthenticated === false) {
      console.log("User not authenticated, redirecting to /login");
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router, setLastPath]);

  // Handler for the back button
  const handleBackToList = () => {
    router.push("/blogs/list");
  };

  // Don't render content or button while authentication status is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading user data...</p>
      </div>
    );
  }

  // If not loading but still not authenticated (should be caught by useEffect, but a fallback)
  if (!isAuthenticated) {
    return null; // Or a message indicating redirection
  }

  return (
    <>
      {/* <NavBar /> */} {/* Uncomment if you have a NavBar component */}
      <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Go Back to List Button - Placed at the top, made small */}
        <div className="max-w-md w-full mx-auto mb-6">
          <div className="w-fit mx-auto">
            <button
              type="button"
              onClick={handleBackToList}
              className="py-1 px-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md shadow flex items-center" // Added 'flex items-center' to align text and icon vertically
            >
              ← Go back to list{" "}
              {/* Added left arrow and a non-breaking space */}
            </button>
          </div>
        </div>

        {/* Main Account Content Card */}
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-0 text-center text-3xl font-extrabold text-gray-900">
              My Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Update your account details.
            </p>
          </div>
          <UpdateProfileForm />{" "}
          {/* Assuming UpdateProfileForm doesn't add its own max-width/centering */}
        </div>
      </div>
    </>
  );
}
