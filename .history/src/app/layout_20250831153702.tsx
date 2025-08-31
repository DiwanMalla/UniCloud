import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniCloud - Secure University File Storage",
  description: "Secure, encrypted cloud storage platform for university students. Organize assignments, notes, and academic resources with subject-based folders and military-grade encryption.",
  keywords: "university, file storage, secure, encrypted, academic, assignments, cloud storage, student, education",
  authors: [{ name: "UniCloud Team" }],
  openGraph: {
    title: "UniCloud - Secure University File Storage",
    description: "Secure, encrypted cloud storage for university files and assignments",
    type: "website",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
