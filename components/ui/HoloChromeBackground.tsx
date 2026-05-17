import styles from "./HoloChromeBackground.module.css";

export function HoloChromeBackground() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={`${styles.grid} ${styles.gridShift}`} />
      <div className={styles.glow} />
    </div>
  );
}
