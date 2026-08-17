import { Stack, Text } from "@chakra-ui/react";
import ResponsivePaginationComponent from "react-responsive-pagination";
import { Select, ChakraStylesConfig } from "chakra-react-select";
import { SnippetPagiProps } from "./../../../types/index";
import "react-responsive-pagination/themes/classic.css";
import { __ } from "@wordpress/i18n";
import { useState } from "react";
import React from "react";
interface perPage {
  value?: number | undefined;
  label?: string;
}

type PerPageOption = { value: number; label: string };

const chakraStyles: ChakraStylesConfig<PerPageOption, false> = {
  container: (provided) => ({ ...provided, minWidth: "90px" }),
  menu: (provided) => ({ ...provided, zIndex: 1500 }),
  menuList: (provided) => ({ ...provided, zIndex: 1500 })
};
const SnippetPagination: React.FC<SnippetPagiProps> = ({
  params,
  setParams,
  totalPages
}) => {
  const perPageOptions = [
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 30, label: "30" },
    { value: 40, label: "40" },
    { value: 50, label: "50" }
  ];

  const defaultPerPage =
    perPageOptions.find((option) => option.value === params?.limit) ||
    perPageOptions[0];

  const [perPage, setPerPage] = useState<perPage>(defaultPerPage);
  return (
    <Stack direction="row" justifyContent="space-between">
      <Stack>
        <Stack spacing={3} direction="row" gap="5px" alignItems="center">
          <Text fontSize="14px" fontWeight="500" lineHeight="normal">
            {__("Per Page", "snippet-master")}
          </Text>
          <Select<PerPageOption>
            useBasicStyles
            size="sm"
            chakraStyles={chakraStyles}
            onChange={(option) => {
              setPerPage({ value: option?.value, label: option?.label });
              setParams((prev) => ({
                ...prev,
                limit: option?.value,
                offset: 1
              }));
            }}
            options={perPageOptions}
            value={perPage as PerPageOption}
            isClearable={false}
            isSearchable={false}
          />
        </Stack>
      </Stack>
      <ResponsivePaginationComponent
        current={params.offset ?? 1}
        total={totalPages}
        onPageChange={(page) => setParams((prev) => ({ ...prev, offset: page }))}
      />
    </Stack>
  );
};

export default SnippetPagination;
