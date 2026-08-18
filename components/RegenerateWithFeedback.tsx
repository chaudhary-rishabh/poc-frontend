"use client";

import { useState } from "react";

interface RegenerateWithFeedbackProps {
  onSubmit: (feedback: string) => void;
  disabled?: boolean;
}

export default function RegenerateWithFeedback({ onSubmit, disabled }: RegenerateWithFeedbackProps) {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState("");

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        disabled={disabled}
        className="text-xs text-zinc-500 underline decoration-dotted hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Regenerate with feedback
      </button>
    );
  }

  const handleSubmit = () => {
    const trimmed = feedback.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setFeedback("");
    setExpanded(false);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="What should change? e.g. 'add a login page to the flow'"
        rows={2}
        autoFocus
        className="w-full resize-none rounded-lg border border-zinc-700 bg-[#0e0e0e] px-2.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-500"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || !feedback.trim()}
          onClick={handleSubmit}
          className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Regenerate
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setFeedback("");
          }}
          className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-[#1e1e1e]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
