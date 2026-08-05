import {
  Box,
  Center,
  Checkbox,
  HStack,
  IconButton,
  Spinner,
  Stack,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast
} from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteSnippets,
  getSnippets,
  updateStatusSnippets
} from "./../../../api/api";
import { RiDeleteBinFill } from "react-icons/ri";
import { BiEdit } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import SnippetFilter from "./SnippetFilter";
import SnippetPagination from "./SnippetPagination";
import {
  GetSnippetsResponse,
  Snippet,
  SnippetParams
} from "./../../../types/index";
import FloatingBulkAction from "./../../../components/common/FloatingBulkAction";
import {
  LanguageBadge,
  ScopeBadge
} from "./../../../components/common/Badges";

const isActive = (value: string | number | boolean | undefined): boolean =>
  value === "1" || value === 1 || value === true;

const SnippetTable: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState<(string | number)[]>([]);

  const currentDate = new Date();

  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];
  const [params, setParams] = useState<SnippetParams>({
    searchByItem: "",
    startDate: startDate,
    endDate: endDate,
    offset: 1,
    limit: 10
  });

  const { data, isLoading, isError, error } = useQuery<GetSnippetsResponse>({
    queryKey: ["snippets", params],
    queryFn: () => getSnippets(params)
  });

  const onClickCheckAll = () => {
    const next = !isCheckAll;
    setIsCheckAll(next);
    setIsCheck(next && data ? data.results.map((snippet) => snippet.id) : []);
  };

  const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setIsCheckAll(false);
    setIsCheck((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const statusMutation = useMutation({
    mutationFn: updateStatusSnippets,
    onSuccess: (res: any) => {
      if (res === false) {
        toast({
          title: __("Update failed!!", "snippet-master"),
          status: "error"
        });
      } else {
        toast({
          title: res.active
            ? __("Activated successfully!!", "snippet-master")
            : __("Deactivated successfully!!", "snippet-master"),
          status: "success",
          duration: 3000,
          isClosable: true
        });
      }
      queryClient.invalidateQueries({ queryKey: ["snippets", params] });
    },
    onError: (error) => {
      toast({
        title: error.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSnippets,
    onSuccess: (res: any) => {
      if (res === false) {
        toast({
          title: __("Deletion failed!!", "snippet-master"),
          status: "error"
        });
      } else {
        toast({
          title: __("Deleted successfully!!", "snippet-master"),
          status: "success",
          duration: 3000,
          isClosable: true
        });
        setIsCheck([]);
        setIsCheckAll(false);
      }
      queryClient.invalidateQueries({ queryKey: ["snippets", params] });
    },
    onError: (error) => {
      toast({
        title: error.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  });

  const statusToggler = ({
    id,
    active
  }: {
    id: number | string;
    active: string | number | boolean;
  }) => {
    statusMutation.mutate({ id, active: !isActive(active) });
  };

  const deleteSnippet = (id: number) => {
    deleteMutation.mutate([id]);
  };

  const handleBulkDelete = () => {
    if (isCheck.length > 0) {
      deleteMutation.mutate(isCheck);
    }
  };

  const editSnippet = (id: number) => {
    navigate(`/snippet/edit/${id}`);
  };

  const paginationProps = {
    params,
    setParams,
    totalPages: data
      ? Math.ceil(Number(data.total_count) / (params.limit ?? 10))
      : 10
  };

  const cardStyle = {
    bg: "white",
    borderRadius: "xl",
    border: "1px solid",
    borderColor: "secondary.200"
  };

  if (isError) {
    return (
      <Box {...cardStyle} p="24px">
        <Center>
          <Text color="red.500">
            {__("Failed to load snippets: ", "snippet-master")} {error.message}
          </Text>
        </Center>
      </Box>
    );
  }

  return (
    <Stack gap="16px">
      <Box {...cardStyle} overflow="hidden">
        <Box p="16px" borderBottom="1px solid" borderColor="secondary.100">
          <SnippetFilter params={params} setParams={setParams} />
        </Box>

        {isLoading ? (
          <Center height="300px">
            <Spinner size="lg" color="primary.500" />
          </Center>
        ) : (
          <TableContainer>
            <Table>
              <Thead bg="secondary.50">
                <Tr>
                  <Th width="48px">
                    <Checkbox
                      onChange={onClickCheckAll}
                      isChecked={isCheckAll}
                      aria-label={__("Select all snippets", "snippet-master")}
                    />
                  </Th>
                  <Th>{__("Snippet", "snippet-master")}</Th>
                  <Th>{__("Language", "snippet-master")}</Th>
                  <Th>{__("Scope", "snippet-master")}</Th>
                  <Th>{__("Priority", "snippet-master")}</Th>
                  <Th>{__("Status", "snippet-master")}</Th>
                  <Th>{__("Updated", "snippet-master")}</Th>
                  <Th textAlign="right">{__("Actions", "snippet-master")}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data && data.results && data.results.length > 0 ? (
                  data.results.map((snippet: Snippet) => (
                    <Tr key={snippet.id} _hover={{ bg: "secondary.50" }}>
                      <Td>
                        <Checkbox
                          id={String(snippet.id)}
                          onChange={(e) => handleClick(e)}
                          isChecked={isCheck.includes(snippet.id)}
                          aria-label={__("Select snippet", "snippet-master")}
                        />
                      </Td>
                      <Td maxW="360px">
                        <Text
                          fontWeight="600"
                          fontSize="14px"
                          color="secondary.900"
                          isTruncated
                        >
                          {snippet.title}
                        </Text>
                        {snippet.description && (
                          <Text
                            fontSize="12px"
                            color="secondary.500"
                            noOfLines={1}
                          >
                            {snippet.description}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <LanguageBadge lang={snippet.lang} />
                      </Td>
                      <Td>
                        <ScopeBadge scope={snippet.scope} />
                      </Td>
                      <Td>
                        <Text fontSize="14px" color="secondary.700">
                          {snippet.priority}
                        </Text>
                      </Td>
                      <Td>
                        <HStack gap="8px">
                          <Switch
                            size="sm"
                            isChecked={isActive(snippet.active)}
                            aria-label={__(
                              "Toggle snippet status",
                              "snippet-master"
                            )}
                            onChange={() =>
                              statusToggler({
                                id: snippet.id,
                                active: snippet.active
                              })
                            }
                          />
                          <Text fontSize="12px" color="secondary.500">
                            {isActive(snippet.active)
                              ? __("Active", "snippet-master")
                              : __("Inactive", "snippet-master")}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="13px" color="secondary.500">
                          {snippet.updated_at
                            ? snippet.updated_at.split(" ")[0]
                            : "—"}
                        </Text>
                      </Td>
                      <Td>
                        <HStack gap="4px" justify="flex-end">
                          <IconButton
                            aria-label={__("Edit snippet", "snippet-master")}
                            icon={<BiEdit />}
                            size="sm"
                            variant="ghost"
                            fontSize="16px"
                            onClick={() => editSnippet(Number(snippet.id))}
                          />
                          <IconButton
                            aria-label={__("Delete snippet", "snippet-master")}
                            icon={<RiDeleteBinFill />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            fontSize="16px"
                            onClick={() => deleteSnippet(Number(snippet.id))}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={8}>
                      <Center py="40px">
                        <Text color="secondary.500">
                          {__("No snippets found", "snippet-master")}
                        </Text>
                      </Center>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {data && (
          <Box p="16px" borderTop="1px solid" borderColor="secondary.100">
            <SnippetPagination {...paginationProps} />
          </Box>
        )}
      </Box>

      {isCheck.length > 0 && (
        <FloatingBulkAction
          bulkIds={isCheck}
          setIsCheckAll={setIsCheckAll}
          setBulkIds={setIsCheck}
          onDelete={handleBulkDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </Stack>
  );
};

export default SnippetTable;
