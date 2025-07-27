import React from "react";
import { Box, Heading, HStack, Image, Stack } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import Menus from "./Menus";
import icon from "./../images/icon.svg";

const Header = () => {
  return (
    <Stack
      width="100%"
      position="fixed"
      zIndex={1}
      padding="18px 25px 18px 25px"
      bg="white"
      height="80px"
      boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
      direction="row"
    >
      <Stack direction="row" justify="space-between" alignItems="center">
        <Stack gap="16px" direction="row" alignItems="center">
          <Image src={icon} />
          <Heading
            as="h6"
            fontWeight="600"
            fontSize="20px"
            lineHeight="8px"
            color="dark.500"
            letterSpacing="0.5px"
          >
            {__("Snippet Master", "snippet-master")}
          </Heading>
          <Menus />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Header;
