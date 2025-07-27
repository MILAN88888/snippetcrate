import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Spinner,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useToast
} from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React, { useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { InfoIcon } from "@chakra-ui/icons";
import CodeSnippetEditor from "./CodeMirrorEditor";
import { AddNew, BackendErrors } from "./../../../types/index";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addNewSnippet, getSnippets } from "./../../../api/api";
import { useNavigate } from "react-router-dom";

interface AddNewFormProps {
  id?: string | number;
}
const AddNewForm: React.FC<AddNewFormProps> = ({ id }) => {
  const toast = useToast();
  const navigate = useNavigate();

  const addNewSnippetMutation = useMutation({
    mutationFn: addNewSnippet,
    onSuccess: (res: any) => {
      toast({
        title: res.message,
        status: "success",
        duration: 3000,
        isClosable: true
      });

      if (id) {
        navigate(`/snippet/edit/${id}`);
      } else {
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
    setValue
  } = useForm<AddNew>({
    defaultValues: {
      id: "",
      title: "",
      codesnippet: "",
      priority: 10,
      description: "",
      tags: "",
      active: 0
    }
  });

  const { data } = useQuery({
    queryKey: [{ id }],
    queryFn: () => getSnippets({ id }),
    enabled: !!id
  });

  useEffect(() => {
    if (data) {
      const snippet = data.results[0];
      Object.keys(snippet).forEach((key: any) => {
        setValue(key as keyof AddNew, snippet[key as keyof AddNew]);
      });
    }
  }, [data, setValue]);
  const onSubmit: SubmitHandler<AddNew> = (data: AddNew) => {
    addNewSnippetMutation.mutate(data);
  };

  return (
    <Stack
      padding="20px 20px 40px 20px"
      height="100vh"
      borderRadius="8px"
      boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" gap="32px" mb="50px">
          <Stack direction="row" gap="32px" justifyContent="flex-start">
            <Stack alignItems="left" justifyContent="flex-start" w="250px">
              <FormLabel>
                <Stack direction="row" gap="8px" alignItems="center">
                  <Text fontWeight="600" fontSize="15px">
                    {__("Add Title", "snippet-master")}
                  </Text>
                  <Tooltip
                    label={__(
                      "Title for the code snippets which help to identify.",
                      "easy-mail-smtp"
                    )}
                    placement="top"
                  >
                    <InfoIcon color="gray.600" />
                  </Tooltip>
                </Stack>
              </FormLabel>
            </Stack>
            <Box minW="900px">
              <FormControl isInvalid={!!errors.title}>
                <Input
                  placeholder={__("Enter the title", "snippet-master")}
                  {...register("title", {
                    required: __("Title is required", "snippet-master")
                  })}
                  type="text"
                />
                {errors.title && (
                  <FormErrorMessage>{errors.title.message}</FormErrorMessage>
                )}
              </FormControl>
            </Box>
          </Stack>
          <Stack direction="row" gap="32px">
            <Stack alignItems="left" justifyContent="flex-start" w="250px">
              <FormLabel>
                <Stack direction="row" gap="8px" alignItems="center">
                  <Text fontWeight="600" fontSize="15px">
                    {__("Add Code Snippets", "snippet-master")}
                  </Text>
                  <Tooltip
                    label={__(
                      "The code snippets which enhance the functionality.",
                      "easy-mail-smtp"
                    )}
                    placement="top"
                  >
                    <InfoIcon color="gray.600" />
                  </Tooltip>
                </Stack>
              </FormLabel>
            </Stack>
            <Box minW="900px">
              <FormControl isInvalid={!!errors.codesnippet}>
                <Controller
                  name="codesnippet"
                  control={control}
                  render={({ field }) => (
                    <CodeSnippetEditor
                      {...field}
                      height="500px"
                      theme="vs-dark"
                      language="php"
                      onChange={(value: string | undefined) =>
                        field.onChange(value ?? "")
                      }
                    />
                  )}
                />
                {errors.codesnippet && (
                  <FormErrorMessage>
                    {errors.codesnippet.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            </Box>
          </Stack>
          <Stack direction="row" gap="32px" justifyContent="flex-start">
            <Stack alignItems="left" justifyContent="flex-start" w="250px">
              <FormLabel>
                <Stack direction="row" gap="8px" alignItems="center">
                  <Text fontWeight="600" fontSize="15px">
                    {__("Priority", "snippet-master")}
                  </Text>
                  <Tooltip
                    label={__(
                      "Set the priority. Low number has high priority.",
                      "easy-mail-smtp"
                    )}
                    placement="top"
                  >
                    <InfoIcon color="gray.600" />
                  </Tooltip>
                </Stack>
              </FormLabel>
            </Stack>
            <Box minW="900px">
              <FormControl isInvalid={!!errors.priority}>
                <Input
                  placeholder={__("Set the priority", "snippet-master")}
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
            </Box>
          </Stack>
          <Stack direction="row" gap="32px" justifyContent="flex-start">
            <Stack alignItems="left" justifyContent="flex-start" w="250px">
              <FormLabel>
                <Stack direction="row" gap="8px" alignItems="center">
                  <Text fontWeight="600" fontSize="15px">
                    {__("Description", "snippet-master")}
                  </Text>
                  <Tooltip
                    label={__(
                      "Add description to identify the purpose of the code snippets for better understanding.",
                      "easy-mail-smtp"
                    )}
                    placement="top"
                  >
                    <InfoIcon color="gray.600" />
                  </Tooltip>
                </Stack>
              </FormLabel>
            </Stack>
            <Box minW="900px">
              <FormControl isInvalid={!!errors.description}>
                <Textarea
                  placeholder={__("Enter the description", "snippet-master")}
                  {...register("description", {
                    required: __("Description is required", "snippet-master")
                  })}
                  border="1px solid #8c8f94"
                ></Textarea>
                {errors.description && (
                  <FormErrorMessage>
                    {errors.description.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            </Box>
          </Stack>
          <Stack direction="row" gap="32px" justifyContent="flex-start">
            <Stack alignItems="left" justifyContent="flex-start" w="250px">
              <FormLabel>
                <Stack direction="row" gap="8px" alignItems="center">
                  <Text fontWeight="600" fontSize="15px">
                    {__("Tags", "snippet-master")}
                  </Text>
                  <Tooltip
                    label={__(
                      "Add tags for sorting and filtering.",
                      "easy-mail-smtp"
                    )}
                    placement="top"
                  >
                    <InfoIcon color="gray.600" />
                  </Tooltip>
                </Stack>
              </FormLabel>
            </Stack>
            <Box minW="900px">
              <FormControl isInvalid={!!errors.tags}>
                <Input
                  placeholder={__(
                    "Enter the tags separated by comma",
                    "snippet-master"
                  )}
                  {...register("tags")}
                  type="text"
                />
              </FormControl>
            </Box>
          </Stack>
          <Stack direction="row" gap="32px" mb="50px">
            <Stack justifyContent="flex-start" w="250px"></Stack>
            <Stack gap="32px" direction="row">
              <Button
                h={50}
                bg="primary.500"
                color="white"
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  if (id) {
                    setValue("id", id);
                  }
                  setValue("active", 1);
                }}
              >
                {isSubmitting ? (
                  <Spinner />
                ) : id ? (
                  __("Update and Active", "snippet-master")
                ) : (
                  __("Save and Active", "snippet-master")
                )}
              </Button>
              <Button
                h={50}
                bg="primary.500"
                color="white"
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  if (id) {
                    setValue("id", id);
                  }
                  setValue("active", 0);
                }}
              >
                {isSubmitting ? (
                  <Spinner />
                ) : id ? (
                  __("Update", "snippet-master")
                ) : (
                  __("Save", "snippet-master")
                )}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
};

export default AddNewForm;
