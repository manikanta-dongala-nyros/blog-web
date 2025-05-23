"use client"; // This page uses client-side hooks

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import NavBar from "@/components/common/GenericForm/Navbar";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying your email...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage(
        "Verification token not found. Please check the link or try registering again."
      );
      setIsError(true);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed.");
        }

        setMessage(
          data.message || "Email verified successfully! You can now log in."
        );
        setIsError(false);
        Swal.fire({
          icon: "success",
          title: "Verification Successful!",
          text: data.message || "You can now log in.",
          confirmButtonText: "Go to Login",
        }).then(() => {
          router.push("/login");
        });
      } catch (error: any) {
        setMessage(
          error.message ||
            "An error occurred during verification. Please try again."
        );
        setIsError(true);
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: error.message || "Please try again or contact support.",
        });
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p
            className={`text-lg ${isError ? "text-red-500" : "text-green-500"}`}
          >
            {message}
          </p>
          {!isError && message.includes("successfully") && (
            <Link
              href="/login"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Go to Login
            </Link>
          )}
          {isError && (
            <Link
              href="/register"
              className="mt-4 inline-block bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Try Registering Again
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading verification status...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
