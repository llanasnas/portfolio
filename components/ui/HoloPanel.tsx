import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./HoloPanel.module.css";

type Variant = "default" | "rare" | "epic" | "locked";

interface HoloPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  cornerTicks?: boolean;
  children?: ReactNode;
}

export const HoloPanel = forwardRef<HTMLDivElement, HoloPanelProps>(
  function HoloPanel(
    { variant = "default", cornerTicks = false, className, children, ...rest },
    ref,
  ) {
    const variantClass =
      variant === "rare"
        ? styles.rare
        : variant === "epic"
          ? styles.epic
          : variant === "locked"
            ? styles.locked
            : "";
    const cls = [styles.root, variantClass, className].filter(Boolean).join(" ");
    return (
      <div ref={ref} className={cls} {...rest}>
        {cornerTicks ? (
          <>
            <span className={styles.ticks} aria-hidden="true" />
            <span className={styles.ticksInner} aria-hidden="true" />
          </>
        ) : null}
        {children}
      </div>
    );
  },
);
