import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-[var(--dark-grey)]">{label}</label>}
      <input
        className={`px-4 py-2 rounded-lg border-2 border-[var(--light-grey)] focus:border-[var(--coppel-blue)] outline-none transition-colors disabled:bg-gray-100 ${
          error ? "border-[var(--red)]" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--red)] font-medium">{error}</span>}
    </div>
  );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-[var(--dark-grey)]">{label}</label>}
      <textarea
        className={`px-4 py-2 rounded-lg border-2 border-[var(--light-grey)] focus:border-[var(--coppel-blue)] outline-none transition-colors disabled:bg-gray-100 ${
          error ? "border-[var(--red)]" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--red)] font-medium">{error}</span>}
    </div>
  );
};
