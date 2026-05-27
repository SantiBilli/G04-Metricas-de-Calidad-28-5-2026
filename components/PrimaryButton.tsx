import React from "react";
import Link from "next/link";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  text: string;
  href?: string;
  variant?: "primary" | "secondary";
}

export default function PrimaryButton({
  icon,
  text,
  href,
  variant = "primary",
  className = "",
  ...props
}: PrimaryButtonProps) {
  const baseClassName =
    variant === "primary"
      ? `flex items-center justify-center gap-2 px-6 py-2.5 rounded-[8px] bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] font-semibold hover:opacity-90 transition-all border border-[var(--color-highlight)] ${className}`
      : `flex items-center justify-center gap-2 px-6 py-2.5 rounded-[8px] border border-[var(--color-neutral-a80)] text-white font-semibold hover:bg-[#1a1a1a] transition-all ${className}`;

  const content = (
    <>
      {icon && (
        <span className="material-symbols-outlined text-[20px] font-light">
          {icon}
        </span>
      )}
      <span className="text-button font-semibold">{text}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClassName} {...(props as any)}>
      {content}
    </button>
  );
}
