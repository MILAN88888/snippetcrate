import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React from "react";
import AddNewForm from "./components/AddNewForm";
import { useNavigate, useParams } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";

const AddNew: React.FC = () => {
  const navigate = useNavigate();

  const { id } = useParams<{ id?: string }>();
  const editProps = id ? { id: id } : {};
  return (
    <Stack
      width="100%"
      padding="20px 40px 40px 60px"
      bg="primary.50"
      height="100vh"
      borderRadius="8px"
      mb="20px"
    >
      <Box height="76px" gap="16px">
        <Stack
          height="60px"
          padding="10px 0px 10px 0px"
          gap="24px"
          direction="column"
        >
          <Stack
            direction="row"
            gap="5px"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading
              fontWeight="600"
              size="18px"
              lineHeight="6px"
              color="dark.500"
            >
              {id
                ? __("Edit Snippet Master", "snippet-master")
                : __("Add New Snippet Master", "snippet-master")}
            </Heading>
            {id && (
              <Button onClick={() => navigate("/")}>
                <TiArrowBack style={{ fontSize: "24px" }} />
              </Button>
            )}
          </Stack>

          <Text
            fontWeight="400"
            size="14px"
            lineHeight="8px"
            color="primary.400"
          >
            {id
              ? __(
                  "Easily edit Snippet Master to your library to enhance your functionality.",
                  "snippet-master"
                )
              : __(
                  "Easily Add New Snippet Master to your library to enhance your functionality.",
                  "snippet-master"
                )}
          </Text>
          <AddNewForm {...editProps} />
        </Stack>
      </Box>
    </Stack>
  );
};

export default AddNew;
