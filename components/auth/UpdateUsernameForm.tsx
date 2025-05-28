"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import Swal from "sweetalert2";

const UpdateProfileForm: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, updateUserFields } = useAuthStore();
  console.log(user);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/update-username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.user?._id, ...formData }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Update failed");

      updateUserFields(data.user); // ✅ Correctly updates Zustand store

      Swal.fire("Success", "Profile updated successfully!", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error instanceof Error ? error.message : "Update failed",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <p>Loading user data...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {/* Username */}
      <div>
        <label
          htmlFor="username"
          // Changed text-sm to text-base and text-gray-700 to text-gray-800
          className="block text-base font-medium text-gray-800"
        >
          Username
        </label>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={handleChange}
          required
          // Added text-base and text-gray-900 for input text clarity
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-base text-gray-900"
        />
      </div>

      {/* First Name */}
      <div>
        <label
          htmlFor="firstName"
          // Changed text-sm to text-base and text-gray-700 to text-gray-800
          className="block text-base font-medium text-gray-800"
        >
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          value={formData.firstName}
          onChange={handleChange}
          // Added text-base and text-gray-900 for input text clarity
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-base text-gray-900"
        />
      </div>

      {/* Last Name */}
      <div>
        <label
          htmlFor="lastName"
          // Changed text-sm to text-base and text-gray-700 to text-gray-800
          className="block text-base font-medium text-gray-800"
        >
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          value={formData.lastName}
          onChange={handleChange}
          // Added text-base and text-gray-900 for input text clarity
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-base text-gray-900"
        />
      </div>

      {/* Submit Button - Already highly visible with text-white on a dark background */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow"
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </form>
  );
};

export default UpdateProfileForm;
