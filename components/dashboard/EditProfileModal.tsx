"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { authService } from "@/services/authService";
import { UserProfile } from "@/types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSaveSuccess: (updatedProfile: UserProfile) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(profile?.name || "");
  const [surname, setSurname] = useState(profile?.surname || "");
  const [pfpUrl, setPfpUrl] = useState(profile?.pfp_url || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.pfp_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || "");
      setSurname(profile.surname || "");
      setPfpUrl(profile.pfp_url || "");
      setPreviewUrl(profile.pfp_url || "");
      setSelectedFile(null);
      setErrorMsg("");
    }
  }, [isOpen, profile]);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Por favor selecciona un archivo de imagen válido.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("La imagen no debe superar los 5MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setErrorMsg("");

    try {
      let finalPfpUrl = pfpUrl;

      if (selectedFile) {
        finalPfpUrl = await authService.uploadAvatar(profile.id, selectedFile);
      }

      const updated = await authService.updateProfile(profile.id, {
        name: name.trim(),
        surname: surname.trim(),
        pfp_url: finalPfpUrl,
      });

      onSaveSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setErrorMsg(err.message || "Error al guardar los cambios de perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div
        className="absolute inset-0 cursor-default"
        onClick={isSaving ? undefined : onClose}
      ></div>

      <div
        className="w-full max-w-[480px] bg-[#1a1c1c] border border-[#4d4638] rounded-[16px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.7)] z-10 flex flex-col gap-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#4d4638]/40 pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[var(--color-dorado)] text-[24px]">
              manage_accounts
            </span>
            <h2 className="text-white text-lg font-bold tracking-wide">
              Editar Perfil
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-[var(--color-neutral-a60)] hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-[8px] bg-red-950/40 border border-red-900/40 backdrop-blur-sm text-red-200 text-xs leading-relaxed animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0 mt-0.5">
              error
            </span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center gap-3">
            <label className="block text-[11px] font-semibold text-[var(--color-neutral-a60)] uppercase tracking-wider">
              Foto de Perfil
            </label>

            <div
              onClick={isSaving ? undefined : handleAvatarClick}
              className={`relative w-28 h-28 rounded-full overflow-hidden border-2 border-[var(--color-neutral-a80)] hover:border-[var(--color-dorado)] transition-all group shadow-inner ${isSaving ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} flex items-center justify-center bg-[#231f20]/60`}
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Vista previa de perfil"
                  fill
                  className="object-cover transition-transform group-hover:scale-105 duration-300"
                  unoptimized={previewUrl.startsWith("blob:") || false}
                />
              ) : (
                <span className="material-symbols-outlined text-[var(--color-dorado)] text-[44px]">
                  person
                </span>
              )}

              {!isSaving && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-white text-[22px]">
                    photo_camera
                  </span>
                  <span className="text-[10px] text-white font-medium uppercase tracking-wider">
                    Cambiar
                  </span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isSaving}
            />

            <p className="text-[10px] text-[var(--color-neutral-a60)] text-center max-w-[200px]">
              Se recomienda una imagen cuadrada de hasta 5MB.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-[var(--color-neutral-a60)] uppercase tracking-wider">
                Nombre
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                placeholder="Nombre"
                className="w-full bg-[#121212] border border-[#4D4638]/60 rounded-[8px] py-2.5 px-4 text-[var(--color-blanco)] text-sm placeholder-[#5d5d5d] focus:outline-none focus:border-[var(--color-highlight)] transition-all disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-[var(--color-neutral-a60)] uppercase tracking-wider">
                Apellido
              </label>
              <input
                type="text"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                disabled={isSaving}
                placeholder="Apellido"
                className="w-full bg-[#121212] border border-[#4D4638]/60 rounded-[8px] py-2.5 px-4 text-[var(--color-blanco)] text-sm placeholder-[#5d5d5d] focus:outline-none focus:border-[var(--color-highlight)] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#4d4638]/40 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-[8px] border border-[var(--color-neutral-a80)] text-white text-sm font-semibold hover:bg-[#2c2c2c]/40 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || !name.trim() || !surname.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-[8px] bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] font-semibold border border-[var(--color-highlight)] text-sm hover:opacity-95 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--color-deepest)] border-t-transparent"></span>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    save
                  </span>
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
