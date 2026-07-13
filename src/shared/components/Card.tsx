import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={[
        "ops-surface rounded-lg",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
