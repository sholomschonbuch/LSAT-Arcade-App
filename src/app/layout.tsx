import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LSAT Arcade",
  description: "Study LSAT the fun way",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <main className="mx-auto max-w-3xl p-6">{children}</main>
      </body>
    </html>
  );
}
