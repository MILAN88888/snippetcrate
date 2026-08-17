import {
  Button,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverTrigger,
  Wrap,
  WrapItem
} from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./../../../hooks/index";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker, RangeKeyDict } from "react-date-range";
import { Select, ChakraStylesConfig } from "chakra-react-select";
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

type Option = { label: string; value: string };

// Menus must clear the FloatingBulkAction Portal (zIndex 99); minW keeps the
// controls from collapsing, everything else inherits the Chakra theme.
const chakraStyles: ChakraStylesConfig<Option, false> = {
  container: (provided) => ({ ...provided, minWidth: "180px" }),
  menu: (provided) => ({ ...provided, zIndex: 1500 }),
  menuList: (provided) => ({ ...provided, zIndex: 1500 })
};

// Local YYYY-MM-DD (never toISOString, which shifts the day west of UTC and
// throws on an invalid date).
const toISODate = (d: Date | undefined): string => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    return "";
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const statusOptions: Option[] = [
  { label: __("Active", "snippet-master"), value: "1" },
  { label: __("Inactive", "snippet-master"), value: "0" }
];

const langOptions: Option[] = [
  { label: __("PHP", "snippet-master"), value: "PHP" },
  { label: __("JavaScript", "snippet-master"), value: "JS" },
  { label: __("CSS", "snippet-master"), value: "CSS" },
  { label: __("HTML", "snippet-master"), value: "HTML" }
];

const SnippetFilter: React.FC<SnippetFilterProps> = ({ params, setParams }) => {
  const [searchByItem, setSearchByItem] = useState<string>(
    params?.searchByItem ?? ""
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: params?.startDate ? new Date(params.startDate) : undefined,
    endDate: params?.endDate ? new Date(params.endDate) : undefined,
    key: "selection"
  });

  const searchByItemValue = useDebounce<string>(searchByItem, 500);

  const { data: tagsData } = useQuery({
    queryKey: ["snippet-tags"],
    queryFn: getTags
  });
  const tagOptions: Option[] = (tagsData?.tags ?? []).map((tag) => ({
    label: tag,
    value: tag
  }));

  const handleSelect = (ranges: RangeKeyDict) => {
    const { selection } = ranges;
    setDateRange({
      startDate: selection.startDate,
      endDate: selection.endDate,
      key: selection.key
    });
    setParams((prev) => ({
      ...prev,
      startDate: toISODate(selection.startDate),
      endDate: toISODate(selection.endDate),
      offset: 1
    }));
  };

  const clearDate = () => {
    setDateRange({ startDate: undefined, endDate: undefined, key: "selection" });
    setParams((prev) => ({
      ...prev,
      startDate: undefined,
      endDate: undefined,
      offset: 1
    }));
  };

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      searchByItem: searchByItemValue,
      offset: 1
    }));
  }, [searchByItemValue, setParams]);

  // react-date-range throws on undefined dates — always hand it real Dates
  // while keeping "unset" in params.
  const widgetRange: DateRange = {
    startDate: dateRange.startDate ?? new Date(),
    endDate: dateRange.endDate ?? new Date(),
    key: "selection"
  };

  const dateLabel =
    dateRange.startDate && dateRange.endDate
      ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
      : __("Select date range", "snippet-master");

  const hasActiveFilters = Boolean(
    searchByItem ||
      dateRange.startDate ||
      dateRange.endDate ||
      params.status ||
      params.tag ||
      params.lang
  );

  const clearAll = () => {
    setSearchByItem("");
    setDateRange({ startDate: undefined, endDate: undefined, key: "selection" });
    setParams((prev) => ({
      ...prev,
      searchByItem: "",
      startDate: undefined,
      endDate: undefined,
      status: undefined,
      tag: undefined,
      lang: undefined,
      offset: 1
    }));
  };

  return (
    <Wrap spacing="12px" align="center">
      <WrapItem>
        <Input
          type="text"
          w="260px"
          size="md"
          value={searchByItem}
          placeholder={__("Search snippets", "snippet-master")}
          onChange={(e) => setSearchByItem(e.target.value)}
        />
      </WrapItem>

      <WrapItem>
        <Popover isLazy placement="bottom-start">
          <PopoverTrigger>
            <Input
              type="text"
              w="240px"
              size="md"
              value={dateLabel}
              placeholder={__("Select date range", "snippet-master")}
              readOnly
              cursor="pointer"
            />
          </PopoverTrigger>
          <PopoverContent w="auto" zIndex={1500}>
            <PopoverBody p="0">
              <DateRangePicker
                ranges={[widgetRange]}
                onChange={handleSelect}
                moveRangeOnFirstSelection={false}
                editableDateInputs={true}
              />
            </PopoverBody>
            <PopoverFooter display="flex" justifyContent="flex-end">
              <Button size="sm" variant="ghost" onClick={clearDate}>
                {__("Clear", "snippet-master")}
              </Button>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </WrapItem>

      <WrapItem>
        <Select<Option>
          useBasicStyles
          size="md"
          chakraStyles={chakraStyles}
          options={statusOptions}
          value={statusOptions.find((o) => o.value === String(params.status)) ?? null}
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
        />
      </WrapItem>

      <WrapItem>
        <Select<Option>
          useBasicStyles
          size="md"
          chakraStyles={chakraStyles}
          options={tagOptions}
          value={tagOptions.find((o) => o.value === params.tag) ?? null}
          onChange={(option) => {
            setParams((prev) => ({
              ...prev,
              tag: option?.value,
              offset: 1
            }));
          }}
          placeholder={__("Any tag", "snippet-master")}
          isClearable
        />
      </WrapItem>

      <WrapItem>
        <Select<Option>
          useBasicStyles
          size="md"
          chakraStyles={chakraStyles}
          options={langOptions}
          value={langOptions.find((o) => o.value === params.lang) ?? null}
          onChange={(option) => {
            setParams((prev) => ({
              ...prev,
              lang: option?.value,
              offset: 1
            }));
          }}
          placeholder={__("Any language", "snippet-master")}
          isClearable
          isSearchable={false}
        />
      </WrapItem>

      {hasActiveFilters && (
        <WrapItem>
          <Button size="md" variant="ghost" onClick={clearAll}>
            {__("Clear filters", "snippet-master")}
          </Button>
        </WrapItem>
      )}
    </Wrap>
  );
};

export default SnippetFilter;
