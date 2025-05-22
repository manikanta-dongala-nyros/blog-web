"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore"; // Assuming you have an auth store
import GenericForm from "@/components/common/GenericForm/GenericForm";
import { FormConfig } from "@/components/common/GenericForm/types";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/blogs/list");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Registration successful! Please login.",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        router.push("/login"); // Redirect to login page after registration
      });
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: "Failed to create account. Please try again.",
      });
    }
  };

  const registerConfig: FormConfig = {
    fields: [
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "Enter your username",
        required: true,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "Enter your email",
        required: true,
      },
    ],
    onSubmit: handleSubmit,
    submitLabel: "Register",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <GenericForm {...registerConfig} className="mt-8 space-y-6" />
      </div>
    </div>
  );
}
