import React from "react";
import { Box, Flex, Heading, HStack } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import Menus from "./Menus";

const Logo: React.FC = () => (
  <Flex
    align="center"
    justify="center"
    boxSize="38px"
    borderRadius="10px"
    bgGradient="linear(135deg, primary.400, primary.600)"
    color="white"
    fontWeight="800"
    fontSize="15px"
    boxShadow="0 4px 12px rgba(37, 99, 235, 0.35)"
  >
    {"</>"}
  </Flex>
);

const Header: React.FC = () => {
  return (
    <Flex
      as="header"
      width="100%"
      px={{ base: "16px", md: "28px" }}
      height="68px"
      bg="white"
      align="center"
      justify="space-between"
      borderBottom="1px solid"
      borderColor="secondary.200"
    >
      <HStack gap={{ base: "16px", md: "32px" }} align="center">
        <HStack gap="12px" align="center">
          <Logo />
          <Heading
            as="h1"
            fontSize="18px"
            fontWeight="700"
            color="secondary.900"
            letterSpacing="-0.2px"
          >
            {__("Snippet Master", "snippet-master")}
          </Heading>
        </HStack>
        <Box display={{ base: "none", md: "block" }}>
          <Menus />
        </Box>
      </HStack>
    </Flex>
  );
};

export default Header;
