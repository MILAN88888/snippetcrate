import React from "react";
import { Flex } from "@chakra-ui/react";

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
    flexShrink={0}
  >
    {"</>"}
  </Flex>
);

export default Logo;
