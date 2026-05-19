"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { GlowButton } from "@/components/ui/GlowButton";
import styles from "./Composer.module.css";

export interface ComposerHandle {
  prefill: (text: string) => void;
  focus: () => void;
}

interface Props {
  disabled: boolean;
  pending: boolean;
  onSend: (query: string) => void;
}

export const Composer = forwardRef<ComposerHandle, Props>(function Composer(
  { disabled, pending, onSend },
  ref,
) {
  const [value, setValue] = useState("");
  const lastSendRef = useRef(0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    prefill: (text: string) => {
      setValue(text);
      taRef.current?.focus();
    },
    focus: () => taRef.current?.focus(),
  }));

  const trySend = useCallback(() => {
    const now = Date.now();
    if (now - lastSendRef.current < 600) return;
    if (!value.trim() || disabled || pending) return;
    lastSendRef.current = now;
    onSend(value);
    setValue("");
  }, [value, disabled, pending, onSend]);

  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <span className={styles.prefix} aria-hidden="true">
          &gt;
        </span>
        <textarea
          ref={taRef}
          className={styles.input}
          rows={1}
          value={value}
          disabled={disabled || pending}
          placeholder={disabled ? "// initialising sweep..." : "probe the signal field"}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              trySend();
            }
          }}
          aria-label="Interpreter query input"
        />
      </div>
      <span className={styles.hint}>↵ send</span>
      <GlowButton
        variant="primary"
        size="sm"
        onClick={trySend}
        disabled={disabled || pending || value.trim().length === 0}
      >
        send
      </GlowButton>
    </div>
  );
});
