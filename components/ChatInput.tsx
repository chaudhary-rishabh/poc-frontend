"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { docLabel } from "@/lib/types";
import type { Effort, ModelInfo, Provider } from "@/lib/types";

const providerLabels: Record<Provider, string> = {
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
};

const effortLabels: Record<Effort, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function DropdownPill<T extends string>({
  label,
  options,
  renderOption,
  selected,
  onSelect,
  disabled,
}: {
  label: string;
  options: T[];
  renderOption: (option: T) => React.ReactNode;
  selected: T | null;
  onSelect: (option: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-700 bg-transparent px-3 text-xs text-zinc-300 outline-none transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {label}
        <span className="text-[10px] text-zinc-500">⌄</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute bottom-full right-0 z-10 mb-2 w-44 overflow-hidden rounded-xl border border-zinc-800 bg-[#1a1a1a] py-1 shadow-xl"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={selected === option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className="flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-[#242424]"
            >
              {renderOption(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatInput() {
  const {
    sessionId,
    activeDoc,
    docs,
    ingestAndStart,
    chatEdit,
    isBusy,
    provider,
    setProvider,
    modelRegistry,
    model,
    setModel,
    effort,
    setEffort,
    currentModelInfo,
  } = useSession();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDocEntry = activeDoc ? docs[activeDoc] : null;
  const editMode = !!sessionId && !!activeDoc && !!activeDocEntry?.data;

  const modelsForProvider: ModelInfo[] = modelRegistry?.[provider] ?? [];

  const handleSubmit = async () => {
    if (isBusy || (!text.trim() && files.length === 0)) return;
    const submittedText = text;
    const submittedFiles = files;
    setText("");
    setFiles([]);

    if (editMode && submittedFiles.length === 0) {
      await chatEdit(submittedText);
    } else {
      await ingestAndStart(submittedText, submittedFiles);
    }
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

  const placeholder = editMode
    ? `What should change in ${docLabel[activeDoc!]}? e.g. 'remove support staff'`
    : "Paste text, or upload files/screenshots to begin";

  return (
    <div className="flex flex-col gap-2 px-4 pb-4">
      {editMode && (
        <p className="px-2 text-xs text-zinc-500">
          Editing: <span className="text-zinc-300">{docs[activeDoc!].label}</span>
        </p>
      )}

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

      <div
        className={`flex items-end gap-2 rounded-3xl border border-zinc-800 bg-[#181818] px-3 py-2 transition-opacity ${
          isBusy ? "opacity-60" : ""
        }`}
      >
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
          disabled={isBusy}
          aria-label="Attach files or screenshots"
          title={editMode ? "Add more source material (separate from editing this doc)" : "Attach files or screenshots"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-[#242424] hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-xl leading-none">+</span>
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isBusy ? "Generating…" : placeholder}
          rows={1}
          disabled={isBusy}
          className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[15px] text-zinc-100 placeholder-zinc-500 outline-none disabled:cursor-not-allowed"
        />

        <DropdownPill
          label={providerLabels[provider]}
          options={Object.keys(providerLabels) as Provider[]}
          selected={provider}
          onSelect={setProvider}
          disabled={isBusy}
          renderOption={(key) => <span className="text-zinc-200">{providerLabels[key]}</span>}
        />

        {modelsForProvider.length > 0 && (
          <DropdownPill
            label={currentModelInfo?.label ?? "Model"}
            options={modelsForProvider.map((m) => m.id)}
            selected={model}
            onSelect={setModel}
            disabled={isBusy}
            renderOption={(id) => {
              const info = modelsForProvider.find((m) => m.id === id);
              if (!info) return id;
              return (
                <span className={`flex items-center gap-1.5 ${info.deprecated ? "text-zinc-500" : "text-zinc-200"}`}>
                  {info.label}
                  {info.deprecated && (
                    <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                      legacy
                    </span>
                  )}
                </span>
              );
            }}
          />
        )}

        {currentModelInfo?.supports_effort && (
          <DropdownPill
            label={effortLabels[effort]}
            options={Object.keys(effortLabels) as Effort[]}
            selected={effort}
            onSelect={setEffort}
            disabled={isBusy}
            renderOption={(key) => <span className="text-zinc-200">{effortLabels[key]}</span>}
          />
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isBusy || (!text.trim() && files.length === 0)}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isBusy ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
          ) : (
            <span className="text-sm">↑</span>
          )}
        </button>
      </div>

      <p className="px-2 text-center text-xs text-zinc-600">AI can make mistakes</p>
    </div>
  );
}
