"use client";

import { useRouter } from "next/navigation";

const NavBar = () => {
  const router = useRouter();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Trending Posts", path: "/trending" },
    { label: "Blogs", path: "/blogs/list" },
    { label: "Users", path: "/users" },
    { label: "Saved Blogs", path: "/saved" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div
          className="text-2xl font-bold text-blue-700 cursor-pointer"
          onClick={() => router.push("/")}
        >
          MyBlogApp
        </div>

        <ul className="flex space-x-8 text-gray-700 font-medium">
          {navItems.map(({ label, path }) => (
            <li
              key={label}
              className="hover:text-blue-600 cursor-pointer transition-colors"
              onClick={() => router.push(path)}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
