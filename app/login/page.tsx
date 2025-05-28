"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Swal from "sweetalert2";
import { FormConfig } from "@/components/common/GenericForm/types";
import GenericForm from "@/components/common/GenericForm/GenericForm";
import Link from "next/link";
import { setCookie } from "cookies-next"; // Add this import

export default function LoginPage() {
  const router = useRouter();

  const { isAuthenticated, isLoading, lastPath, validateRedirectPath } =
    useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectTo = validateRedirectPath(lastPath);
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, lastPath, router, validateRedirectPath]);

  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);

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

      const userData = await response.json();
      console.log("User data:", userData.user);
      setAuth(true);
      setUser(userData);

      // Store user details in cookie
      setCookie("userId", userData.user._id, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Get the last path from store or default to home
      const lastPath = useAuthStore.getState().lastPath;
      // Validate lastPath before redirecting
      const validPaths = ["/", "/blogs/list", "/blogs/create", "/myaccount"];
      const redirectPath =
        lastPath && validPaths.includes(lastPath) ? lastPath : "/";
      router.push(redirectPath);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Login successful!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid credentials. Please try again.",
      });
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
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Enter your password",
        required: true,
      },
    ],
    onSubmit: handleSubmit,
    submitLabel: "Sign In",
  };

  return (
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
          Don't have an account?
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
