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
import React, { useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Parser } from "acorn";
import MonacoEditor from "./MonacoEditor";
import { AddNew, BackendErrors } from "./../../../types/index";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addNewSnippet, getSnippets } from "./../../../api/api";

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

          <FormControl isInvalid={!!errors.codesnippet}>
            <FormLabel fontWeight="600" fontSize="14px" color="secondary.800">
              {__("Code", "snippet-master")}
            </FormLabel>
            <Box
              borderRadius="lg"
              overflow="hidden"
              border="1px solid"
              borderColor={errors.codesnippet ? "red.400" : "secondary.300"}
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
                    onChange={(value: string | undefined) =>
                      field.onChange(value ?? "")
                    }
                  />
                )}
              />
            </Box>
            {errors.codesnippet ? (
              <FormErrorMessage>{errors.codesnippet.message}</FormErrorMessage>
            ) : (
              <Text mt="6px" fontSize="12px" color="secondary.500">
                {lang === "JS"
                  ? __(
                      "JavaScript is validated in your browser before saving.",
                      "snippet-master"
                    )
                  : __(
                      "PHP is syntax-checked on the server before saving.",
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
              placeholder={__(
                "What does this snippet do?",
                "snippet-master"
              )}
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
