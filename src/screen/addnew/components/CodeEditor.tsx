import React, { useEffect, useRef } from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { php } from "@codemirror/lang-php";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { lintGutter, setDiagnostics, Diagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";

export type CodeLanguage = "php" | "javascript" | "css" | "html";

export interface EditorDiagnostic {
  line: number;
  column: number;
  message: string;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: CodeLanguage;
  height?: string;
  /** A single live-validation error to surface in the gutter, or null. */
  diagnostic?: EditorDiagnostic | null;
}

const languageExtension = (language: CodeLanguage) => {
  switch (language) {
    case "javascript":
      return javascript();
    case "css":
      return css();
    case "html":
      return html();
    case "php":
    default:
      // Start in PHP mode (the leading <?php opens it).
      return php();
  }
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  height = "440px",
  diagnostic
}) => {
  const ref = useRef<ReactCodeMirrorRef>(null);

  // Translate the single live error into a CodeMirror diagnostic and paint it
  // (gutter marker + squiggle). Re-runs on error or content change.
  useEffect(() => {
    const view = ref.current?.view;
    if (!view) {
      return;
    }
    let diags: Diagnostic[] = [];
    if (diagnostic) {
      const doc = view.state.doc;
      const lineNo = Math.min(Math.max(diagnostic.line, 1), doc.lines);
      const line = doc.line(lineNo);
      const from = Math.min(
        line.from + Math.max(diagnostic.column - 1, 0),
        line.to
      );
      diags = [
        {
          from,
          to: line.to,
          severity: "error",
          message: diagnostic.message
        }
      ];
    }
    view.dispatch(setDiagnostics(view.state, diags));
  }, [diagnostic, value]);

  return (
    <CodeMirror
      ref={ref}
      value={value}
      height={height}
      theme={oneDark}
      extensions={[languageExtension(language), lintGutter(), EditorView.lineWrapping]}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        foldGutter: false,
        autocompletion: false
      }}
      onChange={(val) => onChange(val)}
    />
  );
};

export default CodeEditor;
