"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/context/SessionContext";
import type { Provider } from "@/lib/types";

const providerLabels: Record<Provider, string> = {
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
};

export default function ChatInput() {
  const { ingestAndStart, isBusy, provider, setProvider } = useSession();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [providerMenuOpen, setProviderMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const providerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!providerMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (providerMenuRef.current && !providerMenuRef.current.contains(e.target as Node)) {
        setProviderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [providerMenuOpen]);

  const handleSubmit = async () => {
    if (isBusy || (!text.trim() && files.length === 0)) return;
    const submittedText = text;
    const submittedFiles = files;
    setText("");
    setFiles([]);
    await ingestAndStart(submittedText, submittedFiles);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-2 px-4 pb-4">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 rounded-full bg-[#1a1a1a] px-3 py-1 text-xs text-zinc-300"
            >
              {file.name}
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-zinc-500 hover:text-zinc-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-3xl border border-zinc-800 bg-[#181818] px-3 py-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach files or screenshots"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-[#242424] hover:text-zinc-100"
        >
          <span className="text-xl leading-none">+</span>
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[15px] text-zinc-100 placeholder-zinc-500 outline-none"
        />

        <div ref={providerMenuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setProviderMenuOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={providerMenuOpen}
            className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-700 bg-transparent px-3 text-xs text-zinc-300 outline-none transition-colors hover:bg-[#242424]"
          >
            {providerLabels[provider]}
            <span className="text-[10px] text-zinc-500">⌄</span>
          </button>

          {providerMenuOpen && (
            <div
              role="listbox"
              className="absolute bottom-full right-0 z-10 mb-2 w-36 overflow-hidden rounded-xl border border-zinc-800 bg-[#1a1a1a] py-1 shadow-xl"
            >
              {(Object.keys(providerLabels) as Provider[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={provider === key}
                  onClick={() => {
                    setProvider(key);
                    setProviderMenuOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-[#242424] ${
                    provider === key ? "text-zinc-50" : "text-zinc-300"
                  }`}
                >
                  {providerLabels[key]}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isBusy || (!text.trim() && files.length === 0)}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="text-sm">↑</span>
        </button>
      </div>

      <p className="px-2 text-center text-xs text-zinc-600">AI can make mistakes</p>
    </div>
  );
}
