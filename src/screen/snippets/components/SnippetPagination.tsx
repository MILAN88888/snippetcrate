import React from "react";
import { __, sprintf } from "@wordpress/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SnippetPagiProps } from "./../../../types/index";

const perPageOptions = [5, 10, 20, 30, 40, 50];

// Build a compact page list with ellipses: 1 … c-1 c c+1 … last.
const pageWindow = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) {
    pages.push("…");
  }
  for (let p = start; p <= end; p++) {
    pages.push(p);
  }
  if (end < total - 1) {
    pages.push("…");
  }
  pages.push(total);
  return pages;
};

const SnippetPagination: React.FC<SnippetPagiProps> = ({
  params,
  setParams,
  totalPages,
  totalCount
}) => {
  const limit = params.limit ?? 10;
  const current = params.offset ?? 1;
  const first = totalCount === 0 ? 0 : (current - 1) * limit + 1;
  const last = Math.min(current * limit, totalCount);

  const goTo = (page: number) =>
    setParams((prev) => ({ ...prev, offset: page }));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          {sprintf(
            /* translators: 1: first row, 2: last row, 3: total. */
            __("Showing %1$s–%2$s of %3$s snippets", "snippet-master"),
            first,
            last,
            totalCount
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {__("Per page", "snippet-master")}
          </span>
          <Select
            value={String(limit)}
            onValueChange={(value) =>
              setParams((prev) => ({
                ...prev,
                limit: Number(value),
                offset: 1
              }))
            }
          >
            <SelectTrigger className="h-9 w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perPageOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label={__("Previous page", "snippet-master")}
          disabled={current <= 1}
          onClick={() => goTo(current - 1)}
        >
          <ChevronLeft />
        </Button>
        {pageWindow(current, Math.max(1, totalPages)).map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === current ? "default" : "outline"}
              size="icon"
              aria-current={p === current ? "page" : undefined}
              onClick={() => goTo(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          aria-label={__("Next page", "snippet-master")}
          disabled={current >= totalPages}
          onClick={() => goTo(current + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default SnippetPagination;
