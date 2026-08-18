import React, { useState, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { Search, CalendarIcon, Tag, X } from "lucide-react";
import { useDebounce } from "./../../../hooks/index";
import { getTags } from "./../../../api/api";
import { SnippetParams } from "./../../../types/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SnippetFilterProps {
  params: SnippetParams;
  setParams: React.Dispatch<React.SetStateAction<SnippetParams>>;
}

// Radix Select can't use an empty-string item value; use a sentinel for "Any".
const ANY = "__any__";

const statusOptions = [
  { label: __("Active", "snippet-master"), value: "1" },
  { label: __("Inactive", "snippet-master"), value: "0" }
];

const langOptions = [
  { label: __("PHP", "snippet-master"), value: "PHP" },
  { label: __("JavaScript", "snippet-master"), value: "JS" },
  { label: __("CSS", "snippet-master"), value: "CSS" },
  { label: __("HTML", "snippet-master"), value: "HTML" }
];

// Local YYYY-MM-DD (never toISOString, which shifts the day west of UTC).
const toISODate = (d: Date | undefined): string => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    return "";
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const SnippetFilter: React.FC<SnippetFilterProps> = ({ params, setParams }) => {
  const [searchByItem, setSearchByItem] = useState<string>(
    params?.searchByItem ?? ""
  );
  const [range, setRange] = useState<DateRange | undefined>(
    params?.startDate
      ? {
          from: new Date(params.startDate),
          to: params?.endDate ? new Date(params.endDate) : undefined
        }
      : undefined
  );

  const searchByItemValue = useDebounce<string>(searchByItem, 500);

  const { data: tagsData } = useQuery({
    queryKey: ["snippet-tags"],
    queryFn: getTags
  });
  const tagOptions = (tagsData?.tags ?? []).map((tag) => ({
    label: tag,
    value: tag
  }));

  const handleRangeSelect = (next: DateRange | undefined) => {
    setRange(next);
    setParams((prev) => ({
      ...prev,
      startDate: toISODate(next?.from),
      endDate: toISODate(next?.to),
      offset: 1
    }));
  };

  const clearDate = () => {
    setRange(undefined);
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

  const dateLabel =
    range?.from && range?.to
      ? `${range.from.toLocaleDateString()} – ${range.to.toLocaleDateString()}`
      : range?.from
        ? range.from.toLocaleDateString()
        : __("Select date range", "snippet-master");

  const hasActiveFilters = Boolean(
    searchByItem ||
      range?.from ||
      range?.to ||
      params.status ||
      params.tag ||
      params.lang
  );

  const clearAll = () => {
    setSearchByItem("");
    setRange(undefined);
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
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[240px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchByItem}
          placeholder={__("Search snippets", "snippet-master")}
          className="pl-9"
          onChange={(e) => setSearchByItem(e.target.value)}
        />
      </div>

      <Select
        value={params.status !== undefined ? String(params.status) : ANY}
        onValueChange={(value) =>
          setParams((prev) => ({
            ...prev,
            status: value === ANY ? undefined : value,
            offset: 1
          }))
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={__("Any status", "snippet-master")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{__("Any status", "snippet-master")}</SelectItem>
          {statusOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={params.lang ?? ANY}
        onValueChange={(value) =>
          setParams((prev) => ({
            ...prev,
            lang: value === ANY ? undefined : value,
            offset: 1
          }))
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={__("Any language", "snippet-master")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>
            {__("Any language", "snippet-master")}
          </SelectItem>
          {langOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[200px] justify-start font-normal",
              !range?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {dateLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            defaultMonth={range?.from}
          />
          <div className="flex justify-end border-t border-border p-2">
            <Button variant="ghost" size="sm" onClick={clearDate}>
              {__("Clear", "snippet-master")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Select
        value={params.tag ?? ANY}
        onValueChange={(value) =>
          setParams((prev) => ({
            ...prev,
            tag: value === ANY ? undefined : value,
            offset: 1
          }))
        }
      >
        <SelectTrigger className="w-[150px]">
          <Tag className="size-4 opacity-60" />
          <SelectValue placeholder={__("Any tag", "snippet-master")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{__("Any tag", "snippet-master")}</SelectItem>
          {tagOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearAll}>
          <X />
          {__("Clear filters", "snippet-master")}
        </Button>
      )}
    </div>
  );
};

export default SnippetFilter;
