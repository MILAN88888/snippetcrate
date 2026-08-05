import React, { forwardRef, useImperativeHandle, useRef } from "react";
import Editor, { EditorProps } from "@monaco-editor/react";
import { editor as MonacoEditorNS } from "monaco-editor";

interface MonacoEditorProps extends EditorProps {
  onMount?: (editor: MonacoEditorNS.IStandaloneCodeEditor) => void;
}

export interface MonacoEditorHandle {
  editor: MonacoEditorNS.IStandaloneCodeEditor | null;
}

const MonacoEditor = forwardRef<MonacoEditorHandle, MonacoEditorProps>(
  (props, ref) => {
    const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);

    useImperativeHandle(ref, () => ({
      editor: editorRef.current
    }));

    return (
      <Editor
        {...props}
        defaultValue={props.language === "php" ? "<?php\n" : ""}
        onMount={(editor) => {
          editorRef.current = editor;
          if (props.onMount) {
            props.onMount(editor);
          }
        }}
      />
    );
  }
);

MonacoEditor.displayName = "MonacoEditor";

export default MonacoEditor;
