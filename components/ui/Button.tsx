import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  children,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = `btn-${variant} ${fullWidth ? "w-full" : ""} ${className}`;

  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}
