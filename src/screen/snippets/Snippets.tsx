import { Box, Divider, Heading, Stack, Text } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React from "react";
import SnippetTable from "./components/SnippetTable";

const Snippets: React.FC = () => {
  return (
    <Stack
      width="100%"
      padding="20px 40px 40px 60px"
      bg="primary.50"
      height="100vh"
      borderRadius="8px"
    >
      <Box height="76px" gap="16px">
        <Stack
          height="60px"
          padding="10px 0px 10px 0px"
          gap="24px"
          direction="column"
        >
          <Heading
            fontWeight="600"
            size="18px"
            lineHeight="6px"
            color="dark.500"
          >
            {__("All Code Snippets", "snippet-master")}
          </Heading>
          <Text
            fontWeight="400"
            size="14px"
            lineHeight="8px"
            color="primary.400"
          >
            {__("Here is list of the all the code snippets.", "snippet-master")}
          </Text>
          <SnippetTable />
        </Stack>
      </Box>
    </Stack>
  );
};

export default Snippets;
