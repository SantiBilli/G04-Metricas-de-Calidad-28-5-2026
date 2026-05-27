"use client";

import React, { useEffect } from "react";

interface SuccessToastProps {
  show: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  title?: string;
  subtitle?: string;
}

export default function SuccessToast({
  show,
  onClose,
  onActionClick,
  title = "Historia clínica guardada con éxito",
  subtitle = "Los cambios se han sincronizado correctamente.",
}: SuccessToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-[#1a1c1c] border border-[#4d4638]/60 rounded-[12px] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50 flex items-center justify-between gap-6 max-w-[480px] animate-in slide-in-from-bottom-5 fade-in duration-300 select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[10px] bg-[#2d2516]/60 border border-[var(--color-dorado)]/30 flex items-center justify-center text-[var(--color-dorado)] flex-shrink-0">
          <span className="material-symbols-outlined text-[20px] font-bold">
            check
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-white text-sm font-semibold">{title}</span>
          <span className="text-[var(--color-neutral-a60)] text-xs mt-0.5">
            {subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (onActionClick) onActionClick();
            onClose();
          }}
          className="text-[var(--color-dorado)] hover:text-[var(--color-highlight)] text-xs font-bold transition-colors cursor-pointer select-none"
        >
          Ver ficha
        </button>
        <button
          onClick={onClose}
          className="text-[var(--color-neutral-a60)] hover:text-white transition-colors flex items-center justify-center p-0.5 rounded cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
