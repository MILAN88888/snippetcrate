import { __ } from "@wordpress/i18n";
import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Parser } from "acorn";
import { Loader2 } from "lucide-react";
import MonacoEditor from "./MonacoEditor";
import { AddNew, BackendErrors } from "./../../../types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addNewSnippet,
  getSnippets,
  validateSnippet
} from "./../../../api/api";
import { useDebounce } from "./../../../hooks/index";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface AddNewFormProps {
  id?: string | number;
}

// Drop a leading `<?php`/`<?` (and its trailing newline) and a trailing `?>`.
const stripPhpOpen = (code: string): string =>
  (code ?? "")
    .replace(/^\s*<\?(php)?\r?\n?/i, "")
    .replace(/\?>\s*$/, "");

// Prepend `<?php\n` unless an opening tag is already present.
const ensurePhpOpen = (code: string): string =>
  /^\s*<\?(php)?/i.test(code ?? "") ? code : `<?php\n${code ?? ""}`;

const RequiredMark: React.FC = () => (
  <span className="text-destructive"> *</span>
);

const labelClass = "text-sm font-semibold text-foreground";

const AddNewForm: React.FC<AddNewFormProps> = ({ id }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const addNewSnippetMutation = useMutation({
    mutationFn: addNewSnippet,
    onSuccess: (res: any) => {
      toast.success(res.message);
      // Refresh the list/stat caches and return to the table.
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      queryClient.invalidateQueries({ queryKey: ["snippet-tags"] });
      navigate("/");
    },
    onError: (error: any) => {
      if (error.errors) {
        const backendErrors: BackendErrors = error.errors;
        Object.entries(backendErrors).forEach(([field, message]) => {
          setError(field as keyof AddNew, {
            type: "server",
            message: message
          });
        });
      }
      toast.error(error.message);
    }
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    reset,
    register,
    setValue,
    watch
  } = useForm<AddNew>({
    defaultValues: {
      id: "",
      title: "",
      codesnippet: "<?php\n",
      priority: 10,
      description: "",
      tags: "",
      active: 0,
      scope: "global",
      lang: "PHP"
    }
  });

  const lang = watch("lang");
  const scope = watch("scope");
  const code = watch("codesnippet");
  const debouncedCode = useDebounce(code ?? "", 500);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const prevLangRef = useRef<string | undefined>(undefined);
  const [liveError, setLiveError] = useState<string | null>(null);

  const {
    data,
    isLoading: isFetching,
    isError: isFetchError,
    error: fetchError
  } = useQuery({
    queryKey: [{ id }],
    queryFn: () => getSnippets({ id }),
    enabled: !!id
  });

  useEffect(() => {
    const snippet = data?.results?.[0];
    if (!snippet) {
      return;
    }
    const l = (snippet.lang ?? "PHP").toUpperCase();
    const hydratedLang = ["PHP", "JS", "CSS", "HTML"].includes(l) ? l : "PHP";
    // Record the hydrated language so the lang-change effect below does not
    // rewrite the loaded code on edit.
    prevLangRef.current = hydratedLang;
    reset({
      id: snippet.id,
      title: snippet.title,
      codesnippet: snippet.codesnippet,
      priority: snippet.priority,
      description: snippet.description,
      tags: snippet.tags,
      active:
        snippet.active === "1" ||
        snippet.active === 1 ||
        snippet.active === true
          ? 1
          : 0,
      scope: snippet.scope ?? "global",
      lang: hydratedLang
    });
  }, [data, reset]);

  // When the language changes, keep the `<?php` opening tag only for PHP:
  // strip it when leaving PHP, re-add it when returning. Skips mount and edit
  // hydration via prevLangRef so an existing snippet is never rewritten.
  useEffect(() => {
    const prev = prevLangRef.current;
    prevLangRef.current = lang;
    if (prev === undefined || prev === lang) {
      return;
    }
    const current = code ?? "";
    if (prev === "PHP" && lang !== "PHP") {
      setValue("codesnippet", stripPhpOpen(current));
    } else if (prev !== "PHP" && lang === "PHP") {
      setValue("codesnippet", ensurePhpOpen(current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Only PHP can target the global scope.
  useEffect(() => {
    if (lang !== "PHP" && scope === "global") {
      setValue("scope", "header");
    }
  }, [lang, scope, setValue]);

  // Live syntax validation while typing: acorn for JS, a debounced
  // server round-trip for PHP. Errors are shown as Monaco markers and a message.
  useEffect(() => {
    let cancelled = false;

    const applyMarker = (
      err: { line: number; column: number; message: string } | null
    ) => {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco) {
        return;
      }
      const model = editor.getModel();
      if (!model) {
        return;
      }
      if (!err) {
        monaco.editor.setModelMarkers(model, "snippet-master", []);
        return;
      }
      monaco.editor.setModelMarkers(model, "snippet-master", [
        {
          startLineNumber: err.line,
          startColumn: err.column,
          endLineNumber: err.line,
          endColumn: model.getLineMaxColumn(err.line),
          message: err.message,
          severity: monaco.MarkerSeverity.Error
        }
      ]);
    };

    const value = debouncedCode ?? "";
    if (value.trim() === "") {
      setLiveError(null);
      applyMarker(null);
      return;
    }

    if (lang === "JS") {
      try {
        Parser.parse(value, {
          ecmaVersion: "latest",
          sourceType: "script",
          allowReturnOutsideFunction: true
        });
        setLiveError(null);
        applyMarker(null);
        clearErrors("codesnippet");
      } catch (e: any) {
        const loc = e?.loc ?? { line: 1, column: 0 };
        const message =
          __("JavaScript syntax error: ", "snippet-master") + e.message;
        setLiveError(message);
        applyMarker({
          line: loc.line ?? 1,
          column: (loc.column ?? 0) + 1,
          message
        });
      }
      return;
    }

    if (lang !== "PHP") {
      // CSS and HTML are not syntax-checked.
      setLiveError(null);
      applyMarker(null);
      clearErrors("codesnippet");
      return;
    }

    // PHP: validate on the server (parses without executing).
    validateSnippet({ codesnippet: value, lang: "PHP" })
      .then((res) => {
        if (cancelled) {
          return;
        }
        if (res.valid) {
          setLiveError(null);
          applyMarker(null);
          clearErrors("codesnippet");
        } else {
          const message =
            __("PHP syntax error: ", "snippet-master") + (res.message ?? "");
          setLiveError(message);
          // The server strips the leading `<?php` before parsing, so its line
          // numbers are one short whenever the tag is present in the editor.
          const offset = /^\s*<\?(php)?/i.test(value) ? 1 : 0;
          applyMarker({ line: (res.line ?? 1) + offset, column: 1, message });
        }
      })
      .catch(() => {
        /* Ignore transient errors during live validation. */
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedCode, lang, clearErrors]);

  const onSubmit: SubmitHandler<AddNew> = (formData: AddNew) => {
    if (formData.lang === "JS") {
      const jsCode = (formData.codesnippet ?? "").replace(/^\s*<\?php/i, "");
      try {
        Parser.parse(jsCode, {
          ecmaVersion: "latest",
          sourceType: "script",
          allowReturnOutsideFunction: true
        });
      } catch (e) {
        setError("codesnippet", {
          type: "syntax",
          message:
            __("JavaScript syntax error: ", "snippet-master") +
            (e as Error).message
        });
        return;
      }
    }
    addNewSnippetMutation.mutate(formData);
  };

  const baseScopes = [
    { value: "header", label: __("Header", "snippet-master") },
    { value: "footer", label: __("Footer", "snippet-master") },
    { value: "shortcode", label: __("Shortcode", "snippet-master") }
  ];
  const scopeOptions =
    lang === "PHP"
      ? [{ value: "global", label: __("Global", "snippet-master") }, ...baseScopes]
      : baseScopes;

  const monacoLanguage =
    lang === "JS"
      ? "javascript"
      : lang === "CSS"
        ? "css"
        : lang === "HTML"
          ? "html"
          : "php";

  const codeError = (errors.codesnippet?.message as string) ?? liveError ?? null;

  if (id && isFetching) {
    return (
      <Card className="flex min-h-[300px] items-center justify-center p-7">
        <Loader2 className="size-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (id && isFetchError) {
    return (
      <Card className="flex min-h-[300px] items-center justify-center p-7">
        <p className="text-destructive">
          {__("Failed to load snippet: ", "snippet-master")}
          {(fetchError as Error)?.message}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-7">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div>
            <Label htmlFor="sm-title" className={labelClass}>
              {__("Title", "snippet-master")}
              <RequiredMark />
            </Label>
            <Input
              id="sm-title"
              className="mt-2"
              placeholder={__("Enter a descriptive title", "snippet-master")}
              type="text"
              {...register("title", {
                required: __("Title is required", "snippet-master")
              })}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label className={labelClass}>
              {__("Code", "snippet-master")}
              <RequiredMark />
            </Label>
            <div
              className={cn(
                "mt-2 overflow-hidden rounded-xl border",
                codeError ? "border-destructive" : "border-border"
              )}
            >
              <Controller
                name="codesnippet"
                control={control}
                rules={{
                  validate: (v) =>
                    stripPhpOpen(v ?? "").trim() !== "" ||
                    __("Code snippet is required", "snippet-master")
                }}
                render={({ field }) => (
                  <MonacoEditor
                    {...field}
                    height="440px"
                    theme="vs-dark"
                    language={monacoLanguage}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      padding: { top: 12, bottom: 12 }
                    }}
                    onMount={(editor, monaco) => {
                      editorRef.current = editor;
                      monacoRef.current = monaco;
                    }}
                    onChange={(value: string | undefined) =>
                      field.onChange(value ?? "")
                    }
                  />
                )}
              />
            </div>
            {codeError ? (
              <p className="mt-1.5 text-xs text-destructive">{codeError}</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {lang === "JS"
                  ? __(
                      "JavaScript is validated as you type (in your browser).",
                      "snippet-master"
                    )
                  : lang === "PHP"
                    ? __(
                        "PHP is syntax-checked as you type (on the server).",
                        "snippet-master"
                      )
                    : __(
                        "CSS and HTML are not syntax-checked.",
                        "snippet-master"
                      )}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <Label className={labelClass}>
                {__("Language", "snippet-master")}
              </Label>
              <Controller
                name="lang"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHP">
                        {__("PHP", "snippet-master")}
                      </SelectItem>
                      <SelectItem value="JS">
                        {__("JavaScript", "snippet-master")}
                      </SelectItem>
                      <SelectItem value="CSS">
                        {__("CSS", "snippet-master")}
                      </SelectItem>
                      <SelectItem value="HTML">
                        {__("HTML", "snippet-master")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label className={labelClass}>
                {__("Scope", "snippet-master")}
              </Label>
              <Controller
                name="scope"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="sm-priority" className={labelClass}>
                {__("Priority", "snippet-master")}
                <RequiredMark />
              </Label>
              <Input
                id="sm-priority"
                className="mt-2"
                placeholder="10"
                type="number"
                min="0"
                step="1"
                {...register("priority", {
                  required: __("Priority is required", "snippet-master"),
                  validate: (value) =>
                    value >= 0 ||
                    __(
                      "Priority must be a non-negative number.",
                      "snippet-master"
                    )
                })}
              />
              {errors.priority && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {scope === "shortcode" && (
            <div className="rounded-md border border-border bg-muted/50 p-3">
              <p className="mb-1.5 text-[13px] text-muted-foreground">
                {id
                  ? __(
                      "Insert this shortcode where you want the snippet to render:",
                      "snippet-master"
                    )
                  : __(
                      "Save the snippet first to get its shortcode.",
                      "snippet-master"
                    )}
              </p>
              {id && (
                <code className="rounded bg-card px-2 py-1 text-sm">
                  {`[snippet_master id="${id}"]`}
                </code>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="sm-description" className={labelClass}>
              {__("Description", "snippet-master")}
              <RequiredMark />
            </Label>
            <Textarea
              id="sm-description"
              className="mt-2"
              placeholder={__("What does this snippet do?", "snippet-master")}
              {...register("description", {
                required: __("Description is required", "snippet-master")
              })}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="sm-tags" className={labelClass}>
              {__("Tags", "snippet-master")}
            </Label>
            <Input
              id="sm-tags"
              className="mt-2"
              placeholder={__(
                "Comma-separated, e.g. analytics, header",
                "snippet-master"
              )}
              type="text"
              {...register("tags")}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                if (id) {
                  setValue("id", id);
                }
                setValue("active", 0);
              }}
            >
              {id ? __("Update", "snippet-master") : __("Save", "snippet-master")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                if (id) {
                  setValue("id", id);
                }
                setValue("active", 1);
              }}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {id
                ? __("Update & Activate", "snippet-master")
                : __("Save & Activate", "snippet-master")}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default AddNewForm;
