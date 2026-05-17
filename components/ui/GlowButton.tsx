import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./GlowButton.module.css";

type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  function GlowButton(
    { variant = "primary", size = "md", className, children, ...rest },
    ref,
  ) {
    const sizeClass =
      size === "lg" ? styles.sizeLg : size === "sm" ? styles.sizeSm : "";
    const variantClass =
      variant === "ghost"
        ? styles.ghost
        : variant === "danger"
          ? styles.danger
          : styles.primary;
    const cls = [styles.btn, variantClass, sizeClass, className]
      .filter(Boolean)
      .join(" ");
    return (
      <button ref={ref} className={cls} {...rest}>
        {children}
      </button>
    );
  },
);
