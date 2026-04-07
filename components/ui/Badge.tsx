import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", className = "" }) => {
  const variants = {
    success: "bg-[var(--green)]/10 text-[var(--dark-green)] border-[var(--dark-green)]/20",
    warning: "bg-[var(--coppel-yellow)]/10 text-[var(--orange)] border-[var(--orange)]/20",
    error: "bg-[var(--red)]/10 text-[var(--red)] border-[var(--red)]/20",
    info: "bg-[var(--coppel-blue)]/10 text-[var(--coppel-blue)] border-[var(--coppel-blue)]/20",
    neutral: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
