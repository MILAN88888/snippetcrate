import { Input, Stack } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./../../../hooks/index";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker, RangeKeyDict } from "react-date-range";
import Select, { StylesConfig } from "react-select";
import { getTags } from "./../../../api/api";
import { SnippetParams } from "./../../../types/index";

interface DateRange {
  startDate?: Date;
  endDate?: Date;
  key?: string;
}
interface SnippetFilterProps {
  params: SnippetParams;
  setParams: React.Dispatch<React.SetStateAction<SnippetParams>>;
}

const selectStyles: StylesConfig<{ label: string; value: string }, false> = {
  control: (provided) => ({
    ...provided,
    width: "220px",
    minHeight: "40px",
    borderColor: "#8c8f94",
    borderRadius: "6px",
    fontSize: "14px",
    padding: "0 4px",
    boxShadow: "none",
    "&:hover": { borderColor: "#CBD5E0" }
  }),
  valueContainer: (provided) => ({ ...provided, padding: "0 8px" }),
  input: (provided) => ({ ...provided, margin: "0px", padding: "0px" }),
  indicatorsContainer: (provided) => ({ ...provided, height: "38px" }),
  singleValue: (provided) => ({ ...provided, color: "#2D3748" }),
  menu: (provided) => ({ ...provided, zIndex: 20 })
};

const SnippetFilter: React.FC<SnippetFilterProps> = ({ params, setParams }) => {
  const [searchByItem, setSearchByItem] = useState<string>(
    params?.searchByItem ?? ""
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: params?.startDate ? new Date(params.startDate) : undefined,
    endDate: params?.endDate ? new Date(params.endDate) : undefined,
    key: "selection"
  });
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);

  const searchByItemValue = useDebounce<string>(searchByItem, 500);

  const { data: tagsData } = useQuery({
    queryKey: ["snippet-tags"],
    queryFn: getTags
  });
  const tagOptions = (tagsData?.tags ?? []).map((tag) => ({
    label: tag,
    value: tag
  }));

  const handleSelect = (ranges: RangeKeyDict) => {
    const { selection } = ranges;
    const formattedStartDate = selection.startDate
      ? selection.startDate.toISOString().split("T")[0]
      : "";
    const formattedEndDate = selection.endDate
      ? selection.endDate.toISOString().split("T")[0]
      : "";

    setDateRange({
      startDate: selection.startDate,
      endDate: selection.endDate,
      key: selection.key
    });
    setParams((prev) => ({
      ...prev,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      offset: 1
    }));
    setIsPickerVisible(false);
  };

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      searchByItem: searchByItemValue,
      offset: 1
    }));
  }, [searchByItemValue, setParams]);

  return (
    <Stack direction="row" gap="12px" wrap="wrap">
      <Input
        type="text"
        w="260px"
        value={searchByItem}
        placeholder={__("Search snippets", "snippet-master")}
        onChange={(e) => setSearchByItem(e.target.value)}
      />
      <Input
        type="text"
        w="240px"
        value={`${dateRange?.startDate?.toLocaleDateString() ?? ""} - ${
          dateRange?.endDate?.toLocaleDateString() ?? ""
        }`}
        placeholder={__("Select date range", "snippet-master")}
        readOnly
        onClick={() => setIsPickerVisible(true)}
      />
      {isPickerVisible && (
        <DateRangePicker
          ranges={[dateRange]}
          onChange={handleSelect}
          moveRangeOnFirstSelection={false}
          editableDateInputs={true}
        />
      )}
      <Select
        options={[
          { label: __("Active", "snippet-master"), value: "1" },
          { label: __("Inactive", "snippet-master"), value: "0" }
        ]}
        onChange={(option) => {
          setParams((prev) => ({
            ...prev,
            status: option?.value,
            offset: 1
          }));
        }}
        placeholder={__("Any status", "snippet-master")}
        isClearable
        isSearchable={false}
        styles={selectStyles}
      />
      <Select
        options={tagOptions}
        onChange={(option) => {
          setParams((prev) => ({
            ...prev,
            tag: option?.value,
            offset: 1
          }));
        }}
        placeholder={__("Any tag", "snippet-master")}
        isClearable
        styles={selectStyles}
      />
    </Stack>
  );
};

export default SnippetFilter;
