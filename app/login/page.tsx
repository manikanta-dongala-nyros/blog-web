"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import GenericForm from "@/components/common/GenericForm/GenericForm";
import { FormConfig } from "@/components/common/GenericForm/types";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/blogs/list"); // Redirect to a different page if already logged in
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      router.push("/blogs/list"); // Redirect to home page after login
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const loginConfig: FormConfig = {
    fields: [
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "Enter your email",
        required: true,
      },
    ],
    onSubmit: handleSubmit,
    submitLabel: "Sign In",
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    //   <div className="max-w-md w-full space-y-8">
    //     <div>
    //       <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
    //         Sign in to your account
    //       </h2>
    //     </div>
    //     <GenericForm {...loginConfig} className="mt-8 space-y-6" />
    //   </div>
    // </div>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 space-y-8 transform transition duration-300 hover:scale-[1.02]">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
            Welcome Back 👋
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        <GenericForm {...loginConfig} className="space-y-6" />
        <div className="text-center text-sm text-gray-500">
          Don’t have an account?
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
