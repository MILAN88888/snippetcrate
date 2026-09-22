import React from "react";
import { createPortal } from "react-dom";
import { __, _n, sprintf } from "@wordpress/i18n";
import { Trash2, X, CheckCircle2, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { usePortalContainer } from "@/components/PortalContext";
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
  const container = usePortalContainer();
  const bulkIdsCount = bulkIds.length;

  if (bulkIdsCount === 0) {
    return null;
  }

  const actions = [
    {
      label: __("Activate", "snippetcrate"),
      value: "activate",
      handler: onActivate,
      icon: <CheckCircle2 />
    },
    {
      label: __("Deactivate", "snippetcrate"),
      value: "deactivate",
      handler: onDeactivate,
      icon: <XCircle />
    },
    {
      label: __("Export", "snippetcrate"),
      value: "export",
      handler: onExport,
      icon: <Download />
    }
  ];

  const bar = (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[99] flex justify-center px-4 duration-200 animate-in slide-in-from-bottom-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-lg bg-foreground px-3 py-2 text-background shadow-lg">
        <span className="text-sm">
          {sprintf(
            /* Translators: %s: Number of selected items. */
            _n(
              "%s item selected",
              "%s items selected",
              bulkIdsCount,
              "snippetcrate"
            ),
            bulkIdsCount
          )}
        </span>
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={__("Deselect all", "snippetcrate")}
                className="flex size-6 items-center justify-center rounded text-background/80 hover:text-background"
                onClick={() => {
                  setIsCheckAll(false);
                  setBulkIds([]);
                }}
              >
                <X className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {__("Unselect items", "snippetcrate")}
            </TooltipContent>
          </Tooltip>
          {actions.map(({ label, value, icon, handler }) => (
            <Button
              key={value}
              onClick={handler}
              size="sm"
              variant="secondary"
              disabled={isBusy}
            >
              {icon}
              {label}
            </Button>
          ))}
          <Button
            onClick={onDelete}
            size="sm"
            variant="destructive"
            disabled={isBusy}
          >
            <Trash2 />
            {__("Delete", "snippetcrate")}
          </Button>
        </div>
      </div>
    </div>
  );

  return container ? createPortal(bar, container) : bar;
};

export default FloatingBulkAction;
