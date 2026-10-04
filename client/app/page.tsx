"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Search,
  ShieldCheck,
  Command,
  CheckCircle2,
  Quote,
  LogIn,
  SlidersHorizontal,
  Database,
  ChevronDown,
} from "lucide-react";
import { Meteors } from "@/components/ui/meteors";
import { Show, UserButton } from "@clerk/nextjs";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { AnimatedBeam } from "@/components/ui/animated-beam";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const beamContainerRef = useRef<HTMLDivElement>(null);

  const node1Ref = useRef<HTMLDivElement>(null);
  const node2Ref = useRef<HTMLDivElement>(null);
  const node3Ref = useRef<HTMLDivElement>(null);
  const node4Ref = useRef<HTMLDivElement>(null);
  const node5Ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-screen w-full bg-zinc-50 dark:bg-[#0B0C0E] text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white transition-colors duration-300 overflow-x-hidden font-sans">
      {/* Subtle Ambient Meteors */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 opacity-40 dark:opacity-60">
        <Meteors number={18} />
      </div>

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 border-b border-zinc-200/80 dark:border-zinc-800/50 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-xs">
            <Command className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            DocBridge
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              2.0
            </span>
          </span>
        </div>

        <nav className="flex items-center gap-3">
          <AnimatedThemeToggler />

          <Show when={"signed-in"}>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 py-1 transition-colors"
            >
              Workspace
            </Link>
            <UserButton />
          </Show>

          <Show when={"signed-out"}>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sign In</span>
            </Link>
          </Show>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 pt-16 pb-24 max-w-4xl mx-auto w-full text-center">
        {/* Release Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-zinc-200/90 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 mb-6 shadow-2xs backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-200">DocBridge 2.0</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>Hybrid Dense + Sparse RAG</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-5 leading-[1.12]">
          Intelligent document analysis, <br />
          <span className="text-zinc-500 dark:text-zinc-400 font-serif italic">
            built for accuracy.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mb-9 leading-relaxed font-normal">
          Upload complex technical papers, contracts, and financial reports for deterministic, citation-backed answers with page-level verification.
        </p>

        <div className="mb-16">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 text-xs sm:text-sm font-medium transition-all shadow-xs active:scale-[0.98]"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Minimalist Product Preview */}
        <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/80 shadow-xl overflow-hidden mb-20 text-left">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="ml-2 text-xs font-mono text-zinc-500">
                regulatory-compliance-q3.pdf
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>DocBridge 2.0 • Indexed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800/80">
            <div className="md:col-span-5 p-5 bg-zinc-50/40 dark:bg-zinc-900/20 text-xs text-zinc-500 dark:text-zinc-400 font-mono space-y-3">
              <div className="text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                Extracted Source Block (p. 42)
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900/60 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 leading-relaxed font-sans text-zinc-700 dark:text-zinc-300">
                <Quote className="w-3.5 h-3.5 text-zinc-400 mb-1" />
                &ldquo;...under subsection 12(B), audits shall be submitted no later
                than 45 calendar days post-fiscal close...&rdquo;
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Page match verified</span>
              </div>
            </div>

            <div className="md:col-span-7 p-5 space-y-3.5 bg-white/40 dark:bg-zinc-950/40">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Query
                </span>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  What is the final statutory deadline for filing compliance audits?
                </p>
              </div>
              <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Grounded Answer
                </span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Per Section 12(B), submissions must be completed within{" "}
                  <strong className="text-zinc-900 dark:text-white font-semibold">
                    45 calendar days
                  </strong>{" "}
                  following the close of the fiscal year.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Animated Pipeline */}
        <div
          ref={beamContainerRef}
          className="relative mb-20 w-full overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 px-6 py-10"
        >
          <div className="mb-8 text-center">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1">
              Document Pipeline
            </p>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              From raw document to verified answer
            </h2>
          </div>

          <div className="relative mx-auto flex flex-col md:flex-row w-full items-center justify-between gap-6 md:gap-0">
            {/* Node 1: PDF */}
            <div
              ref={node1Ref}
              className="relative z-10 flex h-16 w-24 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xs"
            >
              <FileText className="mb-1 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                PDF
              </span>
            </div>

            {/* Node 2: Hybrid Search */}
            <div
              ref={node2Ref}
              className="relative z-10 flex h-16 w-28 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xs"
            >
              <Database className="mb-1 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                Hybrid Search
              </span>
            </div>

            {/* Node 3: Re-Ranker */}
            <div
              ref={node3Ref}
              className="relative z-10 flex h-16 w-28 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xs"
            >
              <SlidersHorizontal className="mb-1 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                Re-Rank
              </span>
            </div>

            {/* Node 4: CRAG Guard */}
            <div
              ref={node4Ref}
              className="relative z-10 flex h-16 w-28 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xs"
            >
              <ShieldCheck className="mb-1 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                CRAG Guard
              </span>
            </div>

            {/* Node 5: Answer */}
            <div
              ref={node5Ref}
              className="relative z-10 flex h-16 w-24 shrink-0 flex-col items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-zinc-900 shadow-2xs"
            >
              <CheckCircle2 className="mb-1 h-4 w-4 text-emerald-500" />
              <span className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                Answer
              </span>
            </div>
          </div>

          {/* Animated Beams */}
          <AnimatedBeam
            containerRef={beamContainerRef}
            fromRef={node1Ref}
            toRef={node2Ref}
            curvature={0}
            pathWidth={1.25}
            pathOpacity={0.12}
            gradientStartColor="#94a3b8"
            gradientStopColor="#64748b"
            duration={6}
            delay={0}
          />
          <AnimatedBeam
            containerRef={beamContainerRef}
            fromRef={node2Ref}
            toRef={node3Ref}
            curvature={0}
            pathWidth={1.25}
            pathOpacity={0.12}
            gradientStartColor="#64748b"
            gradientStopColor="#3b82f6"
            duration={6}
            delay={0.4}
          />
          <AnimatedBeam
            containerRef={beamContainerRef}
            fromRef={node3Ref}
            toRef={node4Ref}
            curvature={0}
            pathWidth={1.25}
            pathOpacity={0.12}
            gradientStartColor="#3b82f6"
            gradientStopColor="#8b5cf6"
            duration={6}
            delay={0.8}
          />
          <AnimatedBeam
            containerRef={beamContainerRef}
            fromRef={node4Ref}
            toRef={node5Ref}
            curvature={0}
            pathWidth={1.25}
            pathOpacity={0.15}
            gradientStartColor="#8b5cf6"
            gradientStopColor="#10b981"
            duration={6}
            delay={1.2}
          />
        </div>

        {/* 3 Core Minimalist Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
          <div className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20">
            <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center mb-3 text-zinc-600 dark:text-zinc-300">
              <Database className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Hybrid Retrieval
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              Combines dense semantic vectors with BM25 lexical token matching to prevent keyword misses.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20">
            <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center mb-3 text-zinc-600 dark:text-zinc-300">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Cross-Encoder Re-Ranking
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              Filters candidate passages down to the top golden snippets, removing irrelevant noise.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20">
            <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center mb-3 text-zinc-600 dark:text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Page-Level Citations
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              Answers link directly to exact page numbers and verifiable excerpts for zero guessing.
            </p>
          </div>
        </div>

        {/* Minimalist FAQ Section */}
        <section className="w-full mt-20 text-left max-w-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70 border-y border-zinc-200/70 dark:border-zinc-800/70">
            {[
              {
                q: "How does DocBridge prevent hallucinations?",
                a: "DocBridge applies Corrective RAG (CRAG) evaluation. Before answering, the model verifies whether the retrieved document snippets are factually sufficient. If relevant evidence is absent, it short-circuits to avoid guessing.",
              },
              {
                q: "How does Hybrid Search improve retrieval accuracy?",
                a: "Traditional vector search often fails on exact IDs, financial figures, or acronyms. DocBridge combines dense 3072d embeddings with sparse BM25 lexical token matching using Reciprocal Rank Fusion (RRF) for extreme keyword and semantic precision.",
              },
              {
                q: "What types of PDF documents are supported?",
                a: "Any PDF file—including multi-column research papers, dense financial filings, regulatory policies, contracts, and technical manuals with tables.",
              },
              {
                q: "Is document data stored privately?",
                a: "Yes. Documents are indexed into isolated vector collections scoped strictly to your workspace session. Your files are never used to train third-party foundation models.",
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ease-out shrink-0 ${isOpen ? "rotate-180 text-zinc-800 dark:text-zinc-200" : ""
                        }`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="pt-2.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pr-6">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/60 py-6 px-6 max-w-6xl mx-auto w-full text-center text-xs text-zinc-400 font-mono">
        DocBridge 2.0 • Grounded Document Intelligence
      </footer>
    </div>
  );
}
