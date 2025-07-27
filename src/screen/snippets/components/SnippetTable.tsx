import {
  Stack,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
  Spinner,
  Center,
  Text,
  Checkbox,
  Switch,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React, { useEffect, useState } from "react";
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
import { GetSnippetsResponse, SnippetParams } from "./../../../types/index";
import FloatingBulkAction from "./../../../components/common/FloatingBulkAction";

const SnippetTable: React.FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [list, setList] = useState<(string | number)[]>([]);
  const [isCheck, setIsCheck] = useState<(string | number)[]>([]);
  const [bulkAction, setBulkAction] = useState("");

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
  const onClickCheckAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(!isCheckAll ? list : []);
    onOpen();
  };

  const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setIsCheckAll(false);

    setIsCheck((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
    onOpen();
  };

  const { data, isLoading, isError, error } = useQuery<GetSnippetsResponse>({
    queryKey: ["snippets", params],
    queryFn: () => getSnippets(params)
  });

  useEffect(() => {
    if (isCheck.length === 0) {
      onClose();
    }
  }, [isCheck]);

  useEffect(() => {
    if ("delete" === bulkAction) {
      deleteMutation.mutate(isCheck);
    }
  }, [bulkAction]);

  useEffect(() => {
    if (data) {
      setList(data.results.map((result) => result.id));
    }
  }, [data]);

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
        onClose();
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
  if (isError) {
    return (
      <Center>
        <Text color="red.500">
          {__("Failed to load snippets: ", "snippet-master")} {error.message}
        </Text>
      </Center>
    );
  }

  const statusToggler = ({ id, active }: { id: number; active: string }) => {
    statusMutation.mutate({ id, active: active === "1" ? false : true });
  };

  const deleteSnippet = (id: number) => {
    deleteMutation.mutate([id]);
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

  return (
    <Stack direction="column" gap="2px">
      <Stack
        p={4}
        bg="white"
        borderRadius="md"
        boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
      >
        <SnippetFilter params={params} setParams={setParams} />
      </Stack>
      {isLoading ? (
        <Stack
          direction="row"
          height="300px"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="sm" />
        </Stack>
      ) : (
        <Stack
          p={4}
          bg="white"
          borderRadius="md"
          boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
        >
          <Table>
            <Thead>
              <Tr>
                <Th>
                  <Checkbox onChange={onClickCheckAll} isChecked={isCheckAll} />
                </Th>
                <Th>
                  <Text fontWeight="600" fontSize="13px" lineHeight="24px">
                    {__("Title", "snippet-master")}
                  </Text>
                </Th>
                <Th>
                  <Text fontWeight="600" fontSize="13px" lineHeight="24px">
                    {__("Description", "snippet-master")}
                  </Text>
                </Th>
                <Th>
                  <Text fontWeight="600" fontSize="13px" lineHeight="24px">
                    {__("Tags", "snippet-master")}
                  </Text>
                </Th>
                <Th>
                  <Text fontWeight="600" fontSize="13px" lineHeight="24px">
                    {__("Updated At", "snippet-master")}
                  </Text>
                </Th>
                <Th>
                  <Text fontWeight="600" fontSize="13px" lineHeight="24px">
                    {__("Priority", "snippet-master")}
                  </Text>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {data && data.results && data.results.length > 0 ? (
                data.results.map((snippet: any, index: number) => (
                  <Tr key={index}>
                    <Td width="50px">
                      <Checkbox
                        key={snippet.id}
                        type="checkbox"
                        id={snippet.id}
                        onChange={(e) => handleClick(e)}
                        isChecked={isCheck.includes(snippet.id)}
                      />
                    </Td>
                    <Td>
                      <Stack direction="column">
                        <Text
                          fontWeight="400"
                          fontSize="14px"
                          lineHeight="24px"
                          color="secondary.900"
                        >
                          {snippet.title}
                        </Text>
                        <Stack direction="row" gap="24px">
                          <Switch
                            size="sm"
                            isChecked={snippet.active === "1"}
                            onChange={() =>
                              statusToggler({
                                id: snippet.id,
                                active: snippet.active
                              })
                            }
                          />
                          <BiEdit
                            onClick={() => editSnippet(snippet.id)}
                            cursor="pointer"
                            style={{ fontSize: "16px" }}
                          />
                          <RiDeleteBinFill
                            onClick={() => deleteSnippet(snippet.id)}
                            cursor="pointer"
                            style={{ fontSize: "16px" }}
                          />
                        </Stack>
                      </Stack>
                    </Td>
                    <Td>
                      <Text
                        fontWeight="400"
                        fontSize="14px"
                        lineHeight="24px"
                        color="secondary.900"
                      >
                        {snippet.description}{" "}
                      </Text>
                    </Td>
                    <Td>
                      <Text
                        fontWeight="400"
                        fontSize="14px"
                        lineHeight="24px"
                        color="secondary.900"
                      >
                        {snippet.tags}
                      </Text>
                    </Td>
                    <Td>
                      <Text
                        fontWeight="400"
                        fontSize="14px"
                        lineHeight="24px"
                        color="secondary.900"
                      >
                        {snippet.updated_at}
                      </Text>
                    </Td>
                    <Td>
                      <Text
                        fontWeight="400"
                        fontSize="14px"
                        lineHeight="24px"
                        color="secondary.900"
                      >
                        {snippet.priority}
                      </Text>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={8}>
                    <Center>
                      <Text>{__("No snippets found", "snippet-master")}</Text>
                    </Center>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Stack>
      )}
      <Stack
        p={4}
        bg="white"
        borderRadius="md"
        boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
        direction="column"
        justifyItems="flex-end"
      >
        {data && <SnippetPagination {...paginationProps} />}
      </Stack>
      {isOpen && (
        <FloatingBulkAction
          openToast={onOpen}
          bulkIds={isCheck}
          setIsCheckAll={setIsCheckAll}
          setBulkIds={setIsCheck}
          setBulkAction={setBulkAction}
        />
      )}
    </Stack>
  );
};

export default SnippetTable;
