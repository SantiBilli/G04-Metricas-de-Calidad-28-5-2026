"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Image from "next/image";
import { authService } from "@/services/authService";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await authService.getSession();
        if (!session) {
          router.push("/auth/login");
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        router.push("/auth/login");
      }
    }
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "var(--degrade-fondo)" }}
      >
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-dorado)]/5 blur-[120px] pointer-events-none animate-pulse"></div>

        <div className="z-10 flex flex-col items-center gap-6">
          <Image
            src="/logo_transparente.png"
            alt="Cargando..."
            width={180}
            height={90}
            className="object-contain animate-pulse"
            priority
          />
          <div className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--color-dorado)] border-t-transparent"></span>
            <span className="text-xs text-[var(--color-neutral-a60)] font-medium tracking-widest uppercase">
              Verificando Sesión...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-row min-h-screen w-full"
      style={{ background: "var(--degrade-fondo)" }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-transparent p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
