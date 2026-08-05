import { Box } from "@chakra-ui/react";
import React from "react";
import Header from "./Header";
import Router from "./router/Router";

const MainLayout: React.FC = () => {
  return (
    <Box minH="100vh" bg="secondary.50">
      <Header />
      <Box
        as="main"
        maxW="1400px"
        mx="auto"
        px={{ base: "16px", md: "32px" }}
        py="28px"
      >
        <Router />
      </Box>
    </Box>
  );
};

export default MainLayout;
