import styles from "./Scanlines.module.css";

interface ScanlinesProps {
  fixed?: boolean;
  sweep?: boolean;
}

export function Scanlines({ fixed = false, sweep = false }: ScanlinesProps) {
  const classes = [styles.root];
  if (fixed) classes.push(styles.fixed);
  if (sweep) classes.push(styles.sweep);
  return <div className={classes.join(" ")} aria-hidden="true" />;
}
