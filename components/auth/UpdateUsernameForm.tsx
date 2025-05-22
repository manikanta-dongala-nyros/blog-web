"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore"; // Adjust path if necessary
import Swal from "sweetalert2";

const UpdateUsernameForm: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, updateUserUsername, setUser } = useAuthStore();
  const [newUsername, setNewUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user) {
      setNewUsername(user.username); // Initialize with current username
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user?._id) {
      Swal.fire("Error", "User information is missing.", "error");
      setIsLoading(false);
      return;
    }

    if (newUsername.trim() === "") {
      Swal.fire("Error", "Username cannot be empty.", "error");
      setIsLoading(false);
      return;
    }
    
    if (newUsername.trim() === user.username) {
      Swal.fire("Info", "Username is already set to this value.", "info");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/update-username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id, newUsername: newUsername.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update username");
      }

      updateUserUsername(data.user.username); // Update username in Zustand store
      // Optionally, if the API returns the full updated user object and you want to refresh it all:
      // setUser(data.user); 

      Swal.fire("Success!", "Username updated successfully!", "success");
      // Optionally redirect or give other feedback
    } catch (error) {
      console.error("Update username error:", error);
      Swal.fire(
        "Error",
        error instanceof Error ? error.message : "An unknown error occurred.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p>Loading user data...</p>; // Or a loading spinner
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={user.email}
          disabled
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          New Username
        </label>
        <input
          type="text"
          id="username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isLoading ? "Updating..." : "Update Username"}
        </button>
      </div>
    </form>
  );
};

export default UpdateUsernameForm;