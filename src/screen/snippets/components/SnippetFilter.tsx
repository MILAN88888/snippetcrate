import { Input, Stack } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React, { useState, useEffect } from "react";
import { useDebounce } from "./../../../hooks/index";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker, RangeKeyDict } from "react-date-range";
import Select from "react-select";

interface DateRange {
  startDate?: Date;
  endDate?: Date;
  key?: string;
}
interface SnippetFilterProps {
  params: Record<string, any>;
  setParams: (params: Record<string, any>) => void;
}

const SnippetFilter: React.FC<SnippetFilterProps> = ({ params, setParams }) => {
  const [searchByItem, setSearchByItem] = useState<string>(
    params?.searchByItem
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(params?.startDate),
    endDate: new Date(params?.endDate),
    key: "selection"
  });
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);

  const searchByItemValue = useDebounce<string>(searchByItem, 500);

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
    setParams({
      ...params,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    setIsPickerVisible(false);
  };

  useEffect(() => {
    setParams(() => ({
      ...params,
      searchByItem: searchByItemValue
    }));
  }, [searchByItemValue, setParams]);

  return (
    <Stack direction="row" gap="16px">
      <Input
        border="1px solid gray.100"
        type="text"
        w="300px"
        value={searchByItem}
        placeholder={__("Search by items", "easy-mail-smtp")}
        onChange={(e) => setSearchByItem(e.target.value)}
      />
      <Input
        border="1px solid gray.100"
        type="text"
        w="300px"
        value={`${dateRange?.startDate?.toLocaleDateString()} - ${dateRange?.endDate?.toLocaleDateString()}`}
        placeholder={__("Select date range", "easy-mail-smtp")}
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
          {
            label: __("Active", "snippet-master"),
            value: "1"
          },
          {
            label: __("Inactive", "snippet-master"),
            value: "0"
          }
        ]}
        onChange={(option) => {
          option && setParams({ ...params, status: option?.value });
        }}
        placeholder={__("Search by status", "snippet-master")}
        isClearable
        isSearchable={false}
        styles={{
          control: (provided) => ({
            ...provided,
            width: "300px",
            height: "40px",
            borderColor: "#8c8f94",
            borderWidth: "1px",
            borderRadius: "4px",
            fontSize: "16px",
            padding: "0 8px",
            boxShadow: "none",
            "&:hover": {
              borderColor: "#CBD5E0"
            }
          }),
          valueContainer: (provided) => ({
            ...provided,
            height: "40px",
            padding: "0 8px"
          }),
          input: (provided) => ({
            ...provided,
            margin: "0px",
            padding: "0px"
          }),
          placeholder: (provided) => ({
            ...provided
          }),
          indicatorsContainer: (provided) => ({
            ...provided,
            height: "40px"
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "#2D3748"
          })
        }}
      />
    </Stack>
  );
};

export default SnippetFilter;
