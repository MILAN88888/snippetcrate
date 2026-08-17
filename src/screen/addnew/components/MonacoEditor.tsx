import React, { forwardRef, useImperativeHandle, useRef } from "react";
import Editor, { EditorProps, Monaco } from "@monaco-editor/react";
import { editor as MonacoEditorNS } from "monaco-editor";

interface MonacoEditorProps extends EditorProps {
  onMount?: (editor: MonacoEditorNS.IStandaloneCodeEditor, monaco: Monaco) => void;
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
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          if (props.onMount) {
            props.onMount(editor, monaco);
          }
        }}
      />
    );
  }
);

MonacoEditor.displayName = "MonacoEditor";

export default MonacoEditor;
