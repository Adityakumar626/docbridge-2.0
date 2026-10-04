"use client";

import React, { useRef, useState, ChangeEvent, DragEvent, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface FileUploadProps {
  onDocUploaded?: (doc: { docId: string; filename: string }) => void;
  onDocCleared?: () => void;
  activeDoc?: { docId: string; filename: string } | null;
}

export const FileUploadComponent: React.FC<FileUploadProps> = ({
  onDocUploaded,
  onDocCleared,
  activeDoc,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>(activeDoc ? "success" : "idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const currentStatus: UploadStatus = activeDoc ? "success" : status;

  const uploadFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setStatus("error");
      setErrorMessage("Only PDF files allowed");
      return;
    }

    setSelectedFile(file);
    setStatus("uploading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/upload/pdf`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setStatus("success");
        onDocUploaded?.({
          docId: data.docId,
          filename: data.filename || file.name,
        });
      } else {
        setStatus("error");
        setErrorMessage(`Upload failed (${res.status})`);
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network connection error");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus("idle");
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onDocCleared?.();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && status !== "uploading") uploadFile(file);
  };

  const displayName = selectedFile?.name || activeDoc?.filename || "document.pdf";

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
        accept="application/pdf"
        className="hidden"
      />

      {currentStatus === "idle" ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-6 rounded-xl border border-dashed cursor-pointer transition-all ${
            isDragging
              ? "border-zinc-500 bg-zinc-100 dark:bg-zinc-800/50"
              : "border-zinc-300 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-zinc-200/80 dark:bg-zinc-800 flex items-center justify-center mb-2.5 text-zinc-600 dark:text-zinc-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
            Choose a PDF <span className="font-normal text-zinc-500">or drag & drop</span>
          </p>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
            PDF files up to 50MB
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3.5 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <FileText className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {displayName}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                {currentStatus === "uploading" && (
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                    Ingesting chunks...
                  </span>
                )}
                {currentStatus === "success" && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready for questions
                  </span>
                )}
                {currentStatus === "error" && (
                  <span className="text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errorMessage}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {currentStatus === "error" && selectedFile && (
                <button
                  onClick={() => uploadFile(selectedFile)}
                  className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded transition-colors"
                  title="Retry upload"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              {currentStatus !== "uploading" && (
                <button
                  onClick={handleReset}
                  className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded transition-colors"
                  title="Remove document"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2.5 w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            {currentStatus === "uploading" && (
              <div className="h-full bg-zinc-500 dark:bg-zinc-400 w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" />
            )}
            {currentStatus === "success" && (
              <div className="h-full bg-emerald-500 w-full" />
            )}
            {currentStatus === "error" && (
              <div className="h-full bg-rose-500 w-full" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
