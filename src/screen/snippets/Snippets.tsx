import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React from "react";
import { useNavigate } from "react-router-dom";
import { BiPlus } from "react-icons/bi";
import SnippetTable from "./components/SnippetTable";

const Snippets: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Stack gap="24px">
      <Flex
        justify="space-between"
        align="flex-start"
        wrap="wrap"
        gap="12px"
      >
        <Box>
          <Heading fontSize="24px" fontWeight="700" color="secondary.900">
            {__("All Code Snippets", "snippet-master")}
          </Heading>
          <Text mt="6px" fontSize="14px" color="secondary.500">
            {__(
              "Manage the PHP, JavaScript, CSS and HTML snippets running on your site.",
              "snippet-master"
            )}
          </Text>
        </Box>
        <Button
          leftIcon={<BiPlus />}
          bg="primary.500"
          color="white"
          _hover={{ bg: "primary.600" }}
          onClick={() => navigate("/snippet/add")}
        >
          {__("Add New Snippet", "snippet-master")}
        </Button>
      </Flex>
      <SnippetTable />
    </Stack>
  );
};

export default Snippets;
