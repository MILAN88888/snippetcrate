import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Textarea,
  useToast
} from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Parser } from "acorn";
import MonacoEditor from "./MonacoEditor";
import { AddNew, BackendErrors } from "./../../../types/index";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addNewSnippet,
  getSnippets,
  validateSnippet
} from "./../../../api/api";
import { useDebounce } from "./../../../hooks/index";

interface AddNewFormProps {
  id?: string | number;
}

const cardStyle = {
  bg: "white",
  borderRadius: "xl",
  border: "1px solid",
  borderColor: "secondary.200",
  p: { base: "16px", md: "28px" }
};

const AddNewForm: React.FC<AddNewFormProps> = ({ id }) => {
  const toast = useToast();

  const addNewSnippetMutation = useMutation({
    mutationFn: addNewSnippet,
    onSuccess: (res: any) => {
      toast({
        title: res.message,
        status: "success",
        duration: 3000,
        isClosable: true
      });

      if (!id) {
        reset();
      }
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
      toast({
        title: error.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
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
      codesnippet: "",
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
      lang: (snippet.lang ?? "PHP").toUpperCase() === "JS" ? "JS" : "PHP"
    });
  }, [data, reset]);

  // JavaScript can only target the header or footer.
  useEffect(() => {
    if (lang === "JS" && scope === "global") {
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
          applyMarker({ line: res.line ?? 1, column: 1, message });
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

  const scopeOptions =
    lang === "JS"
      ? [
          { value: "header", label: __("Header", "snippet-master") },
          { value: "footer", label: __("Footer", "snippet-master") }
        ]
      : [
          { value: "global", label: __("Global", "snippet-master") },
          { value: "header", label: __("Header", "snippet-master") },
          { value: "footer", label: __("Footer", "snippet-master") }
        ];

  const codeError = (errors.codesnippet?.message as string) ?? liveError ?? null;

  if (id && isFetching) {
    return (
      <Box {...cardStyle}>
        <Center minH="300px">
          <Spinner size="lg" color="primary.500" />
        </Center>
      </Box>
    );
  }

  if (id && isFetchError) {
    return (
      <Box {...cardStyle}>
        <Center minH="300px">
          <Text color="red.500">
            {__("Failed to load snippet: ", "snippet-master")}
            {(fetchError as Error)?.message}
          </Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box {...cardStyle}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="24px">
          <FormControl isInvalid={!!errors.title}>
            <FormLabel fontWeight="600" fontSize="14px" color="secondary.800">
              {__("Title", "snippet-master")}
            </FormLabel>
            <Input
              placeholder={__("Enter a descriptive title", "snippet-master")}
              {...register("title", {
                required: __("Title is required", "snippet-master")
              })}
              type="text"
            />
            {errors.title && (
              <FormErrorMessage>{errors.title.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!codeError}>
            <FormLabel fontWeight="600" fontSize="14px" color="secondary.800">
              {__("Code", "snippet-master")}
            </FormLabel>
            <Box
              borderRadius="lg"
              overflow="hidden"
              border="1px solid"
              borderColor={codeError ? "red.400" : "secondary.300"}
            >
              <Controller
                name="codesnippet"
                control={control}
                render={({ field }) => (
                  <MonacoEditor
                    {...field}
                    height="440px"
                    theme="vs-dark"
                    language={lang === "JS" ? "javascript" : "php"}
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
            </Box>
            {codeError ? (
              <Text mt="6px" fontSize="12px" color="red.500">
                {codeError}
              </Text>
            ) : (
              <Text mt="6px" fontSize="12px" color="secondary.500">
                {lang === "JS"
                  ? __(
                      "JavaScript is validated as you type (in your browser).",
                      "snippet-master"
                    )
                  : __(
                      "PHP is syntax-checked as you type (on the server).",
                      "snippet-master"
                    )}
              </Text>
            )}
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px">
            <FormControl>
              <FormLabel fontWeight="600" fontSize="14px" color="secondary.800">
                {__("Language", "snippet-master")}
              </FormLabel>
              <Select {...register("lang")}>
                <option value="PHP">{__("PHP", "snippet-master")}</option>
                <option value="JS">{__("JavaScript", "snippet-master")}</option>
              </Select>
            </FormControl>

            <FormControl isInvalid={!!errors.scope}>
              <FormLabel fontWeight="600" fontSize="14px" color="secondary.800">
                {__("Scope", "snippet-master")}
              </FormLabel>
              <Select {...register("scope")}>
                {scopeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.scope && (
                <FormErrorMessage>{errors.scope.message}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.priority}>
              <FormLabel fontWeight="600" fontSize="14px" color="secondary.800">
                {__("Priority", "snippet-master")}
              </FormLabel>
              <Input
                placeholder="10"
                {...register("priority", {
                  required: __("Priority is required", "snippet-master"),
                  validate: (value) =>
                    value >= 0 ||
                    __(
                      "Priority must be a non-negative number.",
                      "snippet-master"
                    )
                })}
                type="number"
                min="0"
                step="1"
              />
              {errors.priority && (
                <FormErrorMessage>{errors.priority.message}</FormErrorMessage>
              )}
            </FormControl>
          </SimpleGrid>

          <FormControl isInvalid={!!errors.description}>
            <FormLabel fontWeight="600" fontSize="14px" color="secondary.800">
              {__("Description", "snippet-master")}
            </FormLabel>
            <Textarea
              placeholder={__("What does this snippet do?", "snippet-master")}
              {...register("description", {
                required: __("Description is required", "snippet-master")
              })}
            />
            {errors.description && (
              <FormErrorMessage>{errors.description.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="600" fontSize="14px" color="secondary.800">
              {__("Tags", "snippet-master")}
            </FormLabel>
            <Input
              placeholder={__(
                "Comma-separated, e.g. analytics, header",
                "snippet-master"
              )}
              {...register("tags")}
              type="text"
            />
          </FormControl>

          <HStack justify="flex-end" gap="12px" pt="8px">
            <Button
              variant="outline"
              isDisabled={isSubmitting}
              onClick={() => {
                if (id) {
                  setValue("id", id);
                }
                setValue("active", 0);
              }}
              type="submit"
            >
              {id ? __("Update", "snippet-master") : __("Save", "snippet-master")}
            </Button>
            <Button
              bg="primary.500"
              color="white"
              _hover={{ bg: "primary.600" }}
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              onClick={() => {
                if (id) {
                  setValue("id", id);
                }
                setValue("active", 1);
              }}
              type="submit"
            >
              {id
                ? __("Update & Activate", "snippet-master")
                : __("Save & Activate", "snippet-master")}
            </Button>
          </HStack>
        </Stack>
      </form>
    </Box>
  );
};

export default AddNewForm;
