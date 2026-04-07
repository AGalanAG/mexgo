import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md border border-[var(--light-grey)] overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`px-6 py-4 border-b border-[var(--light-grey)] bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`px-6 py-4 border-t border-[var(--light-grey)] bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};
