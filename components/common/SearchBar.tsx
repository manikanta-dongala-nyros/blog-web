"use client";

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

type SearchBarProps = {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialQuery?: string;
};

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`
        relative
        mx-auto
        w-full
        sm:w-72
        max-w-lg
        transition-all duration-300 ease-in-out
        flex items-center
        bg-white shadow-sm rounded-full
        px-4 py-2
        border border-gray-300

        focus-within:w-[24rem]
        focus-within:sm:mx-auto
        focus-within:shadow-lg
        focus-within:ring-2
        focus-within:ring-sky-500
        focus-within:border-transparent
      `}
    >
      <input
        type="text"
        className="flex-grow outline-none bg-transparent text-gray-700 placeholder-gray-400 px-2"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          onSearch(value.trim());
        }}
      />
      <button
        type="submit"
        className="text-sky-600 hover:text-sky-800 transition-colors duration-150"
      >
        <FaSearch />
      </button>
    </form>
  );
};

export default SearchBar;
