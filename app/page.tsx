"use client";

import React, { useState } from "react";

type BlogPost = {
  id: number;
  title: string;
  content: string;
};

export default function HomePage() {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: "Welcome to My Blog",
      content: "This is the first post.",
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: BlogPost = {
      id: posts.length + 1,
      title: formData.title,
      content: formData.content,
    };
    setPosts([...posts, newPost]);
    setFormData({ title: "", content: "" }); // Reset form
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>📝 Blog Viewer</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "0.5rem",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="title"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="content"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Content:
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid #ccc",
              minHeight: "100px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            background: "#0070f3",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.25rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Post
        </button>
      </form>

      {posts.length === 0 ? (
        <p>No blog posts yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {posts.map((post) => (
            <li
              key={post.id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "0.5rem",
              }}
            >
              <h2>{post.title}</h2>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
