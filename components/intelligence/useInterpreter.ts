"use client";

import { useCallback, useRef, useState } from "react";
import type {
  ChatMessage,
  InterpreterApiResponse,
} from "@/lib/intelligence/types";

interface AssistantMessage extends ChatMessage {
  role: "assistant";
  citations: string[];
  retrieved: { id: string; kind: string; label: string }[];
}

interface UserMessage extends ChatMessage {
  role: "user";
}

export type AnyMessage = UserMessage | AssistantMessage;

interface State {
  messages: AnyMessage[];
  pending: boolean;
  error: string | null;
}

export function useInterpreter() {
  const [state, setState] = useState<State>({
    messages: [],
    pending: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setState((s) => ({
      ...s,
      pending: true,
      error: null,
      messages: [...s.messages, { role: "user", content: trimmed }],
    }));

    try {
      const history: ChatMessage[] = state.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: trimmed, history }),
        signal: ctrl.signal,
      });

      const body = (await res.json()) as InterpreterApiResponse;

      if (!body.ok) {
        const fallback =
          body.error === "RATE_LIMITED"
            ? `Signal cooldown active. Retry in ${body.retryAfter ?? 60}s.`
            : body.fallbackText ??
              "Signal absent. Interpreter offline. Try sweep again in a moment.";
        setState((s) => ({
          ...s,
          pending: false,
          error: body.error,
          messages: [
            ...s.messages,
            {
              role: "assistant",
              content: fallback,
              citations: [],
              retrieved: [],
            },
          ],
        }));
        return;
      }

      setState((s) => ({
        ...s,
        pending: false,
        error: null,
        messages: [
          ...s.messages,
          {
            role: "assistant",
            content: body.text,
            citations: body.citations,
            retrieved: body.retrieved,
          },
        ],
      }));
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      console.error("[interpreter] fetch failed", e);
      setState((s) => ({
        ...s,
        pending: false,
        error: "NETWORK",
        messages: [
          ...s.messages,
          {
            role: "assistant",
            content: "Channel disrupted. Interpreter unreachable.",
            citations: [],
            retrieved: [],
          },
        ],
      }));
    }
  }, [state.messages]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ messages: [], pending: false, error: null });
  }, []);

  return { ...state, send, reset };
}
