import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { ThemeProvider } from "./components/theme-provider";

export const metadata: Metadata = {
  title: "DocBridge 2.0 - Intelligent Document Analysis",
  description:
    "DocBridge 2.0 • Grounded document intelligence with hybrid dense-sparse RAG, cross-encoder reranking, and verified page-level citations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen">
          <ThemeProvider>
            <SmoothCursor />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
