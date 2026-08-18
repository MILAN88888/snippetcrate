import React, { useRef, useState } from "react";
import { __ } from "@wordpress/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Pencil,
  Trash2,
  Upload,
  Download,
  ChevronDown,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  bulkUpdateStatus,
  deleteSnippets,
  duplicateSnippet,
  exportSnippets,
  getSnippets,
  importSnippets,
  updateStatusSnippets
} from "./../../../api/api";
import SnippetFilter from "./SnippetFilter";
import SnippetPagination from "./SnippetPagination";
import {
  GetSnippetsResponse,
  Snippet,
  SnippetParams
} from "./../../../types/index";
import FloatingBulkAction from "./../../../components/common/FloatingBulkAction";
import { LanguageBadge, ScopeBadge } from "./../../../components/common/Badges";
import { downloadExport } from "./../../../utils/download";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

const isActive = (value: string | number | boolean | undefined): boolean =>
  value === "1" || value === 1 || value === true;

const SnippetTable: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState<(string | number)[]>([]);

  // Start unfiltered — no date range — so snippets last updated before the
  // current month are visible on first load.
  const [params, setParams] = useState<SnippetParams>({
    searchByItem: "",
    offset: 1,
    limit: 10
  });

  const { data, isLoading, isError, error } = useQuery<GetSnippetsResponse>({
    queryKey: ["snippets", params],
    queryFn: () => getSnippets(params)
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["snippets"] });
    queryClient.invalidateQueries({ queryKey: ["snippet-tags"] });
  };

  const onCheckAll = (checked: boolean) => {
    setIsCheckAll(checked);
    setIsCheck(checked && data ? data.results.map((snippet) => snippet.id) : []);
  };

  const onCheckRow = (id: string | number, checked: boolean) => {
    setIsCheckAll(false);
    setIsCheck((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const notify = (title: string, status: "success" | "error" = "success") =>
    status === "error" ? toast.error(title) : toast.success(title);

  const statusMutation = useMutation({
    mutationFn: updateStatusSnippets,
    onSuccess: (res: any) => {
      if (res === false) {
        notify(__("Update failed!!", "custom-code-snippets-manager"), "error");
      } else {
        notify(
          res.active
            ? __("Activated successfully!!", "custom-code-snippets-manager")
            : __("Deactivated successfully!!", "custom-code-snippets-manager")
        );
      }
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
    },
    onError: (err) => notify(err.message, "error")
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSnippets,
    onSuccess: (res: any) => {
      if (res === false) {
        notify(__("Deletion failed!!", "custom-code-snippets-manager"), "error");
      } else {
        notify(__("Deleted successfully!!", "custom-code-snippets-manager"));
        setIsCheck([]);
        setIsCheckAll(false);
      }
      refresh();
    },
    onError: (err) => notify(err.message, "error")
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateSnippet,
    onSuccess: () => {
      notify(__("Snippet duplicated!!", "custom-code-snippets-manager"));
      refresh();
    },
    onError: (err) => notify(err.message, "error")
  });

  const bulkStatusMutation = useMutation({
    mutationFn: bulkUpdateStatus,
    onSuccess: () => {
      notify(__("Snippets updated!!", "custom-code-snippets-manager"));
      setIsCheck([]);
      setIsCheckAll(false);
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
    },
    onError: (err) => notify(err.message, "error")
  });

  const importMutation = useMutation({
    mutationFn: importSnippets,
    onSuccess: (res: any) => {
      notify(res?.message ?? __("Snippets imported!!", "custom-code-snippets-manager"));
      refresh();
    },
    onError: (err) => notify(err.message, "error")
  });

  const statusToggler = ({
    id,
    active
  }: {
    id: number | string;
    active: string | number | boolean;
  }) => {
    statusMutation.mutate({ id, active: !isActive(active) });
  };

  const deleteSnippet = (id: number) => deleteMutation.mutate([id]);
  const handleBulkDelete = () => {
    if (isCheck.length > 0) {
      deleteMutation.mutate(isCheck);
    }
  };
  const handleBulkActivate = () =>
    isCheck.length > 0 && bulkStatusMutation.mutate({ ids: isCheck, active: 1 });
  const handleBulkDeactivate = () =>
    isCheck.length > 0 && bulkStatusMutation.mutate({ ids: isCheck, active: 0 });

  const handleExport = async (
    ids: (string | number)[],
    format: "json" | "php"
  ) => {
    try {
      const res = await exportSnippets({ ids, format });
      downloadExport(res);
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const snippets = Array.isArray(parsed) ? parsed : parsed?.snippets;
      if (!Array.isArray(snippets)) {
        notify(__("Invalid import file.", "custom-code-snippets-manager"), "error");
        return;
      }
      importMutation.mutate(snippets);
    } catch (err) {
      notify(__("Could not read the import file.", "custom-code-snippets-manager"), "error");
    }
  };

  const editSnippet = (id: number) => navigate(`/snippet/edit/${id}`);

  const totalCount = data ? Number(data.total_count) || 0 : 0;
  const paginationProps = {
    params,
    setParams,
    totalCount,
    totalPages: data ? Math.ceil(totalCount / (params.limit ?? 10)) : 1
  };

  if (isError) {
    return (
      <Card className="p-6">
        <p className="text-center text-destructive">
          {__("Failed to load snippets: ", "custom-code-snippets-manager")} {error.message}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4">
          <SnippetFilter params={params} setParams={setParams} />
          <div className="flex justify-end gap-2">
            <input
              type="file"
              accept=".json,application/json"
              ref={fileInputRef}
              onChange={handleImportFile}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={importMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload />
              {__("Import", "custom-code-snippets-manager")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download />
                  {__("Export", "custom-code-snippets-manager")}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport([], "json")}>
                  {__("Export all (JSON)", "custom-code-snippets-manager")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport([], "php")}>
                  {__("Export all PHP (.php)", "custom-code-snippets-manager")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isCheckAll}
                    onCheckedChange={(checked) => onCheckAll(checked === true)}
                    aria-label={__("Select all snippets", "custom-code-snippets-manager")}
                  />
                </TableHead>
                <TableHead>{__("Snippet", "custom-code-snippets-manager")}</TableHead>
                <TableHead>{__("Language", "custom-code-snippets-manager")}</TableHead>
                <TableHead>{__("Scope", "custom-code-snippets-manager")}</TableHead>
                <TableHead>{__("Priority", "custom-code-snippets-manager")}</TableHead>
                <TableHead>{__("Status", "custom-code-snippets-manager")}</TableHead>
                <TableHead>{__("Updated", "custom-code-snippets-manager")}</TableHead>
                <TableHead className="text-right">
                  {__("Actions", "custom-code-snippets-manager")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.results && data.results.length > 0 ? (
                data.results.map((snippet: Snippet) => (
                  <TableRow key={snippet.id}>
                    <TableCell>
                      <Checkbox
                        checked={isCheck.includes(snippet.id)}
                        onCheckedChange={(checked) =>
                          onCheckRow(snippet.id, checked === true)
                        }
                        aria-label={__("Select snippet", "custom-code-snippets-manager")}
                      />
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {snippet.title}
                      </p>
                      {snippet.description && (
                        <p className="truncate text-xs text-muted-foreground">
                          {snippet.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <LanguageBadge lang={snippet.lang} />
                    </TableCell>
                    <TableCell>
                      <ScopeBadge scope={snippet.scope} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {snippet.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={isActive(snippet.active)}
                        aria-label={__(
                          "Toggle snippet status",
                          "custom-code-snippets-manager"
                        )}
                        onCheckedChange={() =>
                          statusToggler({
                            id: snippet.id,
                            active: snippet.active
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {snippet.updated_at
                          ? snippet.updated_at.split(" ")[0]
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={__(
                                "Duplicate snippet",
                                "custom-code-snippets-manager"
                              )}
                              onClick={() =>
                                duplicateMutation.mutate(snippet.id)
                              }
                            >
                              <Copy />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {__("Duplicate", "custom-code-snippets-manager")}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={__("Edit snippet", "custom-code-snippets-manager")}
                              onClick={() => editSnippet(Number(snippet.id))}
                            >
                              <Pencil />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {__("Edit", "custom-code-snippets-manager")}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              aria-label={__(
                                "Delete snippet",
                                "custom-code-snippets-manager"
                              )}
                              onClick={() => deleteSnippet(Number(snippet.id))}
                            >
                              <Trash2 />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {__("Delete", "custom-code-snippets-manager")}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex justify-center py-10">
                      <p className="text-muted-foreground">
                        {__("No snippets found", "custom-code-snippets-manager")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {data && (
          <div className="border-t border-border p-4">
            <SnippetPagination {...paginationProps} />
          </div>
        )}
      </Card>

      <FloatingBulkAction
        bulkIds={isCheck}
        setIsCheckAll={setIsCheckAll}
        setBulkIds={setIsCheck}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onExport={() => handleExport(isCheck, "json")}
        onDelete={handleBulkDelete}
        isBusy={deleteMutation.isPending || bulkStatusMutation.isPending}
      />
    </div>
  );
};

export default SnippetTable;
