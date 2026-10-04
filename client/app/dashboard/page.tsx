"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Command, ArrowLeft, Menu, X, Sparkles, BookOpen, Layers } from "lucide-react";
import { FileUploadComponent } from "../components/fileUpload";
import ChatComponent from "../components/chat";
import { Meteors } from "@/components/ui/meteors";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<{ docId: string; filename: string } | null>(null);
  const pathname = usePathname();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="relative h-[100dvh] w-full flex flex-col md:flex-row bg-zinc-50 dark:bg-[#0B0C0E] text-zinc-900 dark:text-zinc-100 overflow-hidden selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-300">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <Meteors number={20} />
      </div>

      {/* Mobile Top Header */}
      <header className="md:hidden relative z-40 flex items-center justify-between px-4 h-14 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
            <Command className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight font-sans">
            DocBridge
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatedThemeToggler />
          <UserButton />
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 -mr-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle menu"
          >
            <Menu className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Workspace Panel (Sidebar) */}
      <aside 
        className={`fixed md:relative z-50 w-[85vw] max-w-sm md:w-80 lg:w-92 shrink-0 h-[100dvh] md:h-full border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } shadow-2xl md:shadow-none`}
      >
        {/* Top Header & Navigation */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/60 transition-colors">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <AnimatedThemeToggler />
                <UserButton />
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1.5 -mr-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Document Source
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              Upload a PDF to ground questions in specific pages and verified citations.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div className="pt-1">
            <FileUploadComponent
              activeDoc={activeDoc}
              onDocUploaded={(doc) => setActiveDoc(doc)}
              onDocCleared={() => setActiveDoc(null)}
            />
          </div>

          {/* Retrieval Engine Features */}
          <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/30 p-3.5 space-y-2.5 transition-colors">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              <span>Grounded Intelligence</span>
            </div>

            <div className="space-y-1.5 text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <div className="flex items-center justify-between">
                <span>Search Method</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">Hybrid (Dense + BM25)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reranker</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">Cross-Encoder</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Citation Verification</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Page-Level</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between transition-colors">
          <span>DocBridge Intelligence</span>
          <span className="font-mono text-[10px]">v2.0</span>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="relative z-10 flex-1 h-[calc(100dvh-56px)] md:h-full min-w-0 bg-transparent overflow-hidden flex flex-col">
        <ChatComponent activeDoc={activeDoc} />
      </main>
    </div>
  );
}
