import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  isLoading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-flame text-ink shadow-[0_10px_22px_rgba(255,184,28,0.22)] hover:bg-yellow-300 focus-visible:ring-flame",
  secondary: "bg-white text-paper shadow-sm ring-1 ring-orange-200 hover:bg-orange-50 focus-visible:ring-bone",
  success: "bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-200",
  danger: "bg-ember text-white shadow-[0_10px_22px_rgba(201,31,20,0.24)] hover:bg-red-600 focus-visible:ring-red-300",
  ghost: "bg-transparent text-bone hover:bg-orange-50 focus-visible:ring-bone",
};

export function Button({
  variant = "primary",
  icon,
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      ].join(" ")}
      disabled={disabled || isLoading}
      type={props.type ?? "button"}
      {...props}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {isLoading ? "Procesando…" : children}
    </button>
  );
}
