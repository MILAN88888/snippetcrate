import React from "react";
import { __ } from "@wordpress/i18n";
import { Box, HStack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

const Menus: React.FC = () => {
  const menus = [
    {
      route: "/",
      label: __("All Snippets", "snippet-master"),
      end: true
    },
    {
      route: "/snippet/add",
      label: __("Add New", "snippet-master"),
      end: false
    }
  ];

  return (
    <HStack gap="6px">
      {menus.map((menu) => (
        <Box
          as={NavLink}
          to={menu.route}
          end={menu.end}
          key={menu.route}
          px="14px"
          py="8px"
          borderRadius="md"
          fontSize="14px"
          fontWeight="500"
          color="secondary.600"
          _hover={{ textDecoration: "none", bg: "secondary.100" }}
          sx={{
            "&.active": {
              bg: "primary.100",
              color: "primary.600",
              fontWeight: "600"
            }
          }}
        >
          {menu.label}
        </Box>
      ))}
    </HStack>
  );
};

export default Menus;
