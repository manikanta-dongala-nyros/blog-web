// ./app/layout.tsx (or wherever your RootLayout is)

import "./globals.css"; // Make sure globals.css doesn't conflict with body background/text
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout"; // Assuming this component is designed to fit within any theme

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Ensures text remains visible during font loading
});

export const metadata: Metadata = {
  title: "MyBlogApp | The Modern Edge", // More thematic title
  description:
    "Dive into a seamlessly designed experience with MyBlogApp. Explore, connect, and engage.", // Thematic description
  // Optional: Add theme-color for browser UI consistency on mobile
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }, // slate-900
    { media: "(prefers-color-scheme: light)", color: "#0f172a" }, // Keep it dark, or provide a light theme color
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      {/*
        - bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900: Applies the core dark gradient.
        - text-slate-100: Sets a light default text color for better readability on the dark background.
        - min-h-screen: Ensures the gradient covers the entire viewport height.
        - selection:bg-sky-500 selection:text-white: Styles text selection to match the accent colors.
        - antialiased: For smoother font rendering.
      */}
      <body
        className={`
          min-h-screen
          bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900
          text-slate-100
          selection:bg-sky-500 selection:text-white
        `}
      >
        {/* ClientLayout will now render within this themed body */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
