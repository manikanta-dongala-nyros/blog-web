"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import UpdateUsernameForm from "@/components/auth/UpdateUsernameForm";

export default function MyAccountPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, setLastPath } = useAuthStore();

  useEffect(() => {
    // Save current path before potential redirect
    setLastPath("/myaccount");

    // Only redirect if not loading and not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router, setLastPath]);

  // Don't render content while loading
  if (isLoading) {
    return <div>Loading...</div>;
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
}
