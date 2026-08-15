import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: Props) {
  const variants = {
    primary: "bg-[#8c6d53] text-white hover:bg-[#6f523e] disabled:bg-slate-300",
    secondary:
      "border border-[#d9cabc] bg-white text-[#2c221e] hover:border-[#8c6d53] hover:text-[#8c6d53]",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  };
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
