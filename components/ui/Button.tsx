import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-[var(--coppel-blue)] text-white hover:bg-[var(--dark-blue)] focus:ring-[var(--coppel-blue)]",
    secondary: "bg-[var(--coppel-yellow)] text-[var(--dark-blue)] hover:bg-[#e6c920] focus:ring-[var(--coppel-yellow)]",
    danger: "bg-[var(--red)] text-white hover:bg-[#e65045] focus:ring-[var(--red)]",
    outline: "border-2 border-[var(--coppel-blue)] text-[var(--coppel-blue)] hover:bg-[var(--coppel-blue)] hover:text-white focus:ring-[var(--coppel-blue)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
