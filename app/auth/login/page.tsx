"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("garone@upbrands.agency");
  const [password, setPassword] = useState("123456789");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  React.useEffect(() => {
    async function checkSession() {
      try {
        const session = await authService.getSession();
        if (session) {
          router.push("/dashboard/pacientes");
        }
      } catch (err) {
        console.error("Error checking active session:", err);
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await authService.signIn(email, password);
      router.push("/dashboard/pacientes");
    } catch (err: any) {
      console.error("Error signing in:", err);
      setIsLoading(false);

      if (err.message === "Invalid login credentials") {
        setErrorMsg(
          "Credenciales inválidas. Por favor, verifica tu correo y contraseña.",
        );
      } else {
        setErrorMsg(
          err.message || "Ocurrió un error al intentar iniciar sesión.",
        );
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 select-none"
      style={{ background: "var(--degrade-fondo)" }}
    >
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-dorado)]/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-dorado)]/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] bg-[#1a1c1c]/90 backdrop-blur-md rounded-[16px] border border-[#4d4638]/40 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-10 flex flex-col items-center">
        <div className="mb-6 flex justify-center w-full">
          <Image
            src="/logo_transparente.png"
            alt="Dr. Garone Logo"
            width={180}
            height={90}
            className="object-contain"
            priority
          />
        </div>

        <h2 className="text-white text-lg font-bold text-center mb-1 tracking-wide">
          Portal Médico
        </h2>
        <p className="text-[var(--color-neutral-a60)] text-xs text-center mb-8">
          Ingresa tus credenciales para acceder
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-[8px] bg-red-950/40 border border-red-900/40 backdrop-blur-sm text-red-200 text-xs leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0 mt-0.5">
                error
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col w-full mb-5">
            <label className="block text-[11px] font-semibold text-[var(--color-neutral-a60)] uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-[#5d5d5d] text-[18px]">
                mail
              </span>
              <input
                type="email"
                required
                placeholder="ejemplo@drgarone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#121212] border border-[#4D4638]/60 rounded-[8px] py-2.5 pl-12 pr-4 text-[var(--color-blanco)] text-sm placeholder-[#5d5d5d] focus:outline-none focus:border-[var(--color-highlight)] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-col w-full mb-6">
            <label className="block text-[11px] font-semibold text-[var(--color-neutral-a60)] uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-[#5d5d5d] text-[18px]">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#121212] border border-[#4D4638]/60 rounded-[8px] py-2.5 pl-12 pr-12 text-[var(--color-blanco)] text-sm placeholder-[#5d5d5d] focus:outline-none focus:border-[var(--color-highlight)] transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 text-[#5d5d5d] hover:text-[var(--color-dorado)] transition-colors flex items-center justify-center p-0.5 rounded cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between w-full mb-8">
            <label className="flex items-center gap-2 text-xs text-[var(--color-neutral-a60)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded border-[#4D4638] bg-[#121212] accent-[var(--color-dorado)] focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-50"
              />
              <span>Recuérdame</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] font-bold hover:opacity-95 active:scale-98 transition-all border border-[var(--color-highlight)] text-sm cursor-pointer shadow-md disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--color-deepest)] border-t-transparent"></span>
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px] font-bold">
                  login
                </span>
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
