"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const baseClasses =
    "flex items-center gap-3 px-4 py-3 rounded-[8px] transition-all";

  const activeClasses =
    "border border-[var(--color-highlight)] bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] font-semibold";
  const inactiveClasses =
    "text-[var(--color-neutral-a60)] hover:text-[var(--color-blanco)] hover:bg-[#1a1a1a] border border-transparent";

  return (
    <aside className="w-[280px] min-h-screen bg-transparent border-r border-[var(--color-neutral-a80)] flex flex-col pt-12 px-6">
      <div className="flex justify-center mb-10">
        <Link href="/dashboard">
          <Image
            src="/logo_transparente.png"
            alt="Dr. Garone Logo"
            width={160}
            height={80}
            className="object-contain hover:opacity-80 transition-opacity"
            priority
          />
        </Link>
      </div>

      <nav className="flex flex-col gap-2">
        <Link
          href="/dashboard/pacientes"
          className={`${baseClasses} ${pathname.includes("/pacientes") ? activeClasses : inactiveClasses}`}
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="text-nav-bar">Pacientes</span>
        </Link>

        <Link
          href="/dashboard/calendario"
          className={`${baseClasses} ${pathname.includes("/calendario") ? activeClasses : inactiveClasses}`}
        >
          <span className="material-symbols-outlined text-[20px]">
            calendar_month
          </span>
          <span className="text-nav-bar">Calendario</span>
        </Link>
      </nav>
    </aside>
  );
}
