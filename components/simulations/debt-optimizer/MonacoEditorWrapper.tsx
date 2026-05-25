"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import type { editor as MonacoEditorNS, IDisposable } from "monaco-editor";
import styles from "./JsEditor.module.css";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface CompletionItem {
  label: string;
  insertText: string;
  detail: string;
  kind: "variable" | "function" | "snippet" | "property" | "method";
}

interface CompletionContext {
  objectName: string | null;
  prefix: string;
  replaceStart: number;
}

const CORE_COMPLETIONS: CompletionItem[] = [
  {
    label: "sendResponse(transfers)",
    insertText: "sendResponse(transfers)",
    detail: "Apply transfers to canvas",
    kind: "function",
  },
  {
    label: "forEach((item) => { ... })",
    insertText: "forEach((item) => {\n  \n})",
    kind: "snippet",
    detail: "Array method snippet",
  },
  {
    label: "map((item) => ...)",
    insertText: "map((item) => )",
    kind: "snippet",
    detail: "Array method snippet",
  },
  {
    label: "filter((item) => ...)",
    insertText: "filter((item) => )",
    kind: "snippet",
    detail: "Array method snippet",
  },
  {
    label: "reduce((acc, item) => ..., init)",
    insertText: "reduce((acc, item) => , )",
    kind: "snippet",
    detail: "Array method snippet",
  },
  {
    label: "push(value)",
    insertText: "push()",
    kind: "snippet",
    detail: "Array method snippet",
  },
  {
    label: "find((item) => ...)",
    insertText: "find((item) => )",
    kind: "snippet",
    detail: "Array method snippet",
  },
];

const MEMBER_COMPLETIONS: CompletionItem[] = [
  {
    label: "forEach((item) => { ... })",
    insertText: "forEach((item) => {\n  \n})",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "map((item) => ...)",
    insertText: "map((item) => )",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "filter((item) => ...)",
    insertText: "filter((item) => )",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "reduce((acc, item) => ..., init)",
    insertText: "reduce((acc, item) => , )",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "find((item) => ...)",
    insertText: "find((item) => )",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "sort((a, b) => ...)",
    insertText: "sort((a, b) => )",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "push(value)",
    insertText: "push()",
    detail: "Array method",
    kind: "method",
  },
];

function getCompletionContext(code: string, cursor: number): CompletionContext {
  const before = code.slice(0, cursor);
  const dotMatch = before.match(/([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)?$/);
  if (dotMatch) {
    const objectName = dotMatch[1] ?? null;
    const prefix = dotMatch[2] ?? "";
    return {
      objectName,
      prefix,
      replaceStart: cursor - prefix.length,
    };
  }

  const tokenMatch = before.match(/([A-Za-z_$][\w$]*)$/);
  const prefix = tokenMatch?.[1] ?? "";
  return {
    objectName: null,
    prefix,
    replaceStart: cursor - prefix.length,
  };
}

function scoreCompletion(item: CompletionItem, prefix: string): number {
  const label = item.label.toLowerCase();
  const p = prefix.toLowerCase();
  if (!p) return 1;
  if (label === p) return 100;
  if (label.startsWith(p)) return 60;
  if (label.includes(p)) return 25;
  return 0;
}

function getCompletions(
  context: CompletionContext,
  forceAll: boolean,
): CompletionItem[] {
  const source = context.objectName ? MEMBER_COMPLETIONS : CORE_COMPLETIONS;

  return source
    .map((item) => ({ item, score: scoreCompletion(item, context.prefix) }))
    .filter(({ score }) => forceAll || score > 0)
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
    .slice(0, 8)
    .map(({ item }) => item);
}

function toMonacoKind(
  monaco: typeof import("monaco-editor"),
  kind: CompletionItem["kind"],
): import("monaco-editor").languages.CompletionItemKind {
  if (kind === "function") return monaco.languages.CompletionItemKind.Function;
  if (kind === "method") return monaco.languages.CompletionItemKind.Method;
  if (kind === "variable") return monaco.languages.CompletionItemKind.Variable;
  if (kind === "property") return monaco.languages.CompletionItemKind.Property;
  return monaco.languages.CompletionItemKind.Snippet;
}

interface MonacoEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  onBlockedPaste: () => void;
  hintSignal: number;
  expanded: boolean;
}

export function MonacoEditorWrapper({
  value,
  onChange,
  onBlockedPaste,
  hintSignal,
  expanded,
}: MonacoEditorWrapperProps) {
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const completionRef = useRef<IDisposable | null>(null);
  const signatureRef = useRef<IDisposable | null>(null);

  const handleMount = useCallback(
    (
      editor: MonacoEditorNS.IStandaloneCodeEditor,
      monaco: typeof import("monaco-editor"),
    ) => {
      editorRef.current = editor;

      monaco.editor.defineTheme("groupio-cyber", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "4b5468", fontStyle: "italic" },
          { token: "delimiter", foreground: "64748b" },
          { token: "number", foreground: "5ad7ff" },
          { token: "string", foreground: "68d391" },
          { token: "operator", foreground: "fbb6ce" },
          { token: "keyword", foreground: "b87bff" },
          { token: "function", foreground: "7dd3fc" },
          { token: "variable", foreground: "f6ad55" },
        ],
        colors: {
          "editor.background": "#04060e",
          "editor.foreground": "#c7d2e0",
          "editorCursor.foreground": "#5ad7ff",
          "editor.selectionBackground": "#5ad7ff2e",
          "editorLineNumber.foreground": "#4b5e70",
          "editorLineNumber.activeForeground": "#7ea4c5",
          "editorSuggestWidget.background": "#050914",
          "editorSuggestWidget.border": "#2a4c68",
          "editorSuggestWidget.selectedBackground": "#143044",
        },
      });
      monaco.editor.setTheme("groupio-cyber");

      completionRef.current?.dispose();
      completionRef.current = monaco.languages.registerCompletionItemProvider(
        "javascript",
        {
          triggerCharacters: ["."],
          provideCompletionItems(model, position, context) {
            const cursor = model.getOffsetAt(position);
            const completionContext = getCompletionContext(model.getValue(), cursor);
            const forceAll = context.triggerKind === 0;
            const suggestions = getCompletions(completionContext, forceAll).map((item) => {
              const start = model.getPositionAt(completionContext.replaceStart);
              return {
                label: item.label,
                detail: item.detail,
                kind: toMonacoKind(monaco, item.kind),
                insertText: item.insertText,
                range: {
                  startLineNumber: start.lineNumber,
                  startColumn: start.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
                sortText: `${String(100 - scoreCompletion(item, completionContext.prefix)).padStart(3, "0")}_${item.label}`,
              };
            });

            return { suggestions };
          },
        },
      );

      signatureRef.current?.dispose();
      signatureRef.current = monaco.languages.registerSignatureHelpProvider(
        "javascript",
        {
          signatureHelpTriggerCharacters: ["("],
          provideSignatureHelp(model, position) {
            const cursor = model.getOffsetAt(position);
            const before = model.getValue().slice(0, cursor);
            if (!/sendResponse\s*\([^)]*$/.test(before)) {
              return {
                value: {
                  signatures: [],
                  activeSignature: 0,
                  activeParameter: 0,
                },
                dispose: () => {},
              };
            }

            return {
              value: {
                signatures: [
                  {
                    label:
                      "sendResponse(transfers: Array<{ from: string; to: string; amount: number }>)",
                    parameters: [
                      {
                        label: "transfers",
                        documentation:
                          "Lista final de transferencias para aplicar al canvas.",
                      },
                    ],
                  },
                ],
                activeSignature: 0,
                activeParameter: 0,
              },
              dispose: () => {},
            };
          },
        },
      );

      editor.onDidPaste(() => {
        onBlockedPaste();
        editor.trigger("blocked-paste", "undo", null);
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
        editor.trigger("keyboard", "editor.action.triggerSuggest", null);
      });
    },
    [onBlockedPaste],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (value === editor.getValue()) return;
    editor.setValue(value);
  }, [value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.layout();
  }, [expanded]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || hintSignal === 0) return;
    editor.trigger("hint-btn", "editor.action.triggerSuggest", null);
    editor.focus();
  }, [hintSignal]);

  useEffect(() => {
    return () => {
      completionRef.current?.dispose();
      signatureRef.current?.dispose();
    };
  }, []);

  return (
    <div className={styles.monacoHost}>
      <MonacoEditor
        language="javascript"
        value={value}
        height="100%"
        width="100%"
        onMount={handleMount}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{
          minimap: { enabled: false },
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          lineHeight: 20,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          quickSuggestions: { other: true, comments: false, strings: false },
          suggestOnTriggerCharacters: true,
          inlineSuggest: { enabled: false },
          contextmenu: false,
          padding: { top: 14, bottom: 14 },
          scrollbar: {
            verticalScrollbarSize: 4,
            horizontalScrollbarSize: 4,
          },
        }}
      />
    </div>
  );
}
