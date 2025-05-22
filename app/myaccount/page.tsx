"use client"; // If UpdateUsernameForm or NavBar are client components

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import UpdateUsernameForm from "@/components/auth/UpdateUsernameForm"; // Adjust path
import useAuthStore from "@/stores/authStore"; // Adjust path
// import NavBar from "@/components/NavBar"; // Assuming you have a NavBar component

const MyAccountPage: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Or a loading spinner/message while redirecting
  }

  return (
    <>
      {/* <NavBar /> */} {/* Uncomment if you have a NavBar component */}
      <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              My Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Update your account details.
            </p>
          </div>
          <UpdateUsernameForm />
        </div>
      </div>
    </>
  );
};

export default MyAccountPage;