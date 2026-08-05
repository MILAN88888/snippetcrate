import React from "react";
import {
  Button,
  ButtonGroup,
  IconButton,
  Portal,
  Slide,
  Stack,
  Text,
  Tooltip
} from "@chakra-ui/react";
import { __, _n, sprintf } from "@wordpress/i18n";
import {
  BiTrash,
  BiX,
  BiCheckCircle,
  BiXCircle,
  BiExport
} from "react-icons/bi";
import { BulkActionProps } from "./../../types/index";

const FloatingBulkAction: React.FC<BulkActionProps> = (props) => {
  const {
    bulkIds,
    setIsCheckAll,
    setBulkIds,
    onActivate,
    onDeactivate,
    onExport,
    onDelete,
    isBusy
  } = props;
  const bulkIdsCount = bulkIds.length;
  const actions = [
    {
      label: __("Activate", "snippet-master"),
      value: "activate",
      handler: onActivate,
      icon: <BiCheckCircle />,
      colorScheme: "green"
    },
    {
      label: __("Deactivate", "snippet-master"),
      value: "deactivate",
      handler: onDeactivate,
      icon: <BiXCircle />,
      colorScheme: "gray"
    },
    {
      label: __("Export", "snippet-master"),
      value: "export",
      handler: onExport,
      icon: <BiExport />,
      colorScheme: "blue"
    },
    {
      label: __("Delete", "snippet-master"),
      value: "delete",
      handler: onDelete,
      icon: <BiTrash />,
      colorScheme: "red"
    }
  ];
  return (
    <>
      <Portal>
        <Slide
          style={{ pointerEvents: "none", zIndex: 99 }}
          delay={0.01}
          in={bulkIdsCount > 0}
          unmountOnExit={true}
          direction="bottom"
        >
          <Stack justify="center" align="center" mb="4" pointerEvents="none">
            <Stack
              direction="row"
              bg="gray.800"
              px="3"
              py="2"
              rounded="md"
              alignItems="center"
            >
              <Text color="gray.100">
                {sprintf(
                  /* Translators: %s: Number of selected items. */
                  _n(
                    "%s item selected",
                    "%s items selected",
                    bulkIdsCount,
                    "snippet-master"
                  ),
                  bulkIdsCount
                )}
              </Text>
              <ButtonGroup pointerEvents="auto">
                <Tooltip label={__("Unselect items", "snippet-master")}>
                  <IconButton
                    size="xs"
                    fontSize="lg"
                    variant="link"
                    minW="auto"
                    icon={<BiX />}
                    colorScheme="red"
                    aria-label={__("Deselect all", "snippet-master")}
                    onClick={() => {
                      setIsCheckAll(false);
                      setBulkIds([]);
                    }}
                  />
                </Tooltip>
                {actions.map(({ label, value, icon, colorScheme, handler }) => (
                  <Button
                    key={value}
                    onClick={handler}
                    colorScheme={colorScheme}
                    borderRadius="md"
                    size="xs"
                    leftIcon={icon}
                    isLoading={isBusy}
                  >
                    {label}
                  </Button>
                ))}
              </ButtonGroup>
            </Stack>
          </Stack>
        </Slide>
      </Portal>
    </>
  );
};

export default FloatingBulkAction;
