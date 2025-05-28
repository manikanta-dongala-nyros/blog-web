"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react"; // uses lucide icons

const NavBar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Trending Posts", path: "/trending" },
    { label: "Blogs", path: "/blogs/list" },
    { label: "My Blogs", path: "/blogs/my-blogs" }, // Added this line
    { label: "Users", path: "/users/list" },
    { label: "Saved Blogs", path: "/blogs/saved" },
    { label: "MyAccount", path: "/myaccount" },
  ];

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-blue-700 cursor-pointer"
          onClick={() => router.push("/")}
        >
          MyBlogApp
        </div>

        {/* Hamburger icon */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-blue-700 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop nav */}
        <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
          {navItems.map(({ label, path }) => (
            <li
              key={path}
              className="hover:text-blue-600 cursor-pointer transition-colors"
              onClick={() => router.push(path)}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile nav */}
      {isMenuOpen && (
        <ul className="md:hidden px-6 pb-4 space-y-2 bg-white text-gray-700 font-medium shadow-md">
          {navItems.map(({ label, path }) => (
            <li
              key={path}
              className="hover:text-blue-600 cursor-pointer transition-colors py-1 border-b"
              onClick={() => {
                router.push(path);
                setIsMenuOpen(false);
              }}
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default NavBar;
