"use client";

import React, { useState, useEffect, useRef } from "react";

interface NuevaEvolucionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}

export default function NuevaEvolucionModal({
  isOpen,
  onClose,
  onSave,
}: NuevaEvolucionModalProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText("");
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSave(text.trim());
      setText("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      <div
        className="w-full max-w-[800px] bg-[#1a1c1c] border border-[#4d4638] rounded-[16px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.7)] z-10 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[var(--color-dorado)] text-[24px]">
            assignment
          </span>
          <h2 className="text-white text-lg font-bold tracking-wide">
            Nueva Evolución
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <textarea
            ref={textareaRef}
            placeholder="Lorem ipsum dolor..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full bg-[#121212] border border-[#4d4638]/50 rounded-[8px] p-4 text-[var(--color-blanco)] text-sm placeholder-[#5d5d5d] focus:outline-none focus:border-[var(--color-highlight)] transition-all resize-none leading-relaxed"
            required
          />

          <div className="flex justify-start">
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-[8px] bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] font-bold border border-[var(--color-highlight)] text-nav-bar hover:opacity-95 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[18px]">
                edit_note
              </span>
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
