import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";
import AddNewForm from "./components/AddNewForm";

const AddNew: React.FC = () => {
  const navigate = useNavigate();

  const { id } = useParams<{ id?: string }>();
  const editProps = id ? { id: id } : {};

  return (
    <Stack gap="24px">
      <Flex justify="space-between" align="center" wrap="wrap" gap="12px">
        <Box>
          <Heading fontSize="24px" fontWeight="700" color="secondary.900">
            {id
              ? __("Edit Snippet", "snippet-master")
              : __("Add New Snippet", "snippet-master")}
          </Heading>
          <Text mt="6px" fontSize="14px" color="secondary.500">
            {id
              ? __(
                  "Update this snippet and its settings.",
                  "snippet-master"
                )
              : __(
                  "Create a new PHP or JavaScript snippet for your site.",
                  "snippet-master"
                )}
          </Text>
        </Box>
        <Button
          variant="outline"
          leftIcon={<TiArrowBack />}
          onClick={() => navigate("/")}
        >
          {__("Back to snippets", "snippet-master")}
        </Button>
      </Flex>
      <AddNewForm {...editProps} />
    </Stack>
  );
};

export default AddNew;
