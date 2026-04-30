import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ClientIdProvider from "@/components/ClientIdProvider/ClientIdProvider";
import Nav from "@/components/Nav/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flashcard Learning",
  description: "Learn English vocabulary with spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClientIdProvider>
          <Nav />
          <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
            {children}
          </main>
        </ClientIdProvider>
      </body>
    </html>
  );
}
