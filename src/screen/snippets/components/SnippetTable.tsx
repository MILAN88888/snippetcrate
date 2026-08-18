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
import { cn } from "@/lib/utils";
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
        notify(__("Update failed!!", "snippet-master"), "error");
      } else {
        notify(
          res.active
            ? __("Activated successfully!!", "snippet-master")
            : __("Deactivated successfully!!", "snippet-master")
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
        notify(__("Deletion failed!!", "snippet-master"), "error");
      } else {
        notify(__("Deleted successfully!!", "snippet-master"));
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
      notify(__("Snippet duplicated!!", "snippet-master"));
      refresh();
    },
    onError: (err) => notify(err.message, "error")
  });

  const bulkStatusMutation = useMutation({
    mutationFn: bulkUpdateStatus,
    onSuccess: () => {
      notify(__("Snippets updated!!", "snippet-master"));
      setIsCheck([]);
      setIsCheckAll(false);
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
    },
    onError: (err) => notify(err.message, "error")
  });

  const importMutation = useMutation({
    mutationFn: importSnippets,
    onSuccess: (res: any) => {
      notify(res?.message ?? __("Snippets imported!!", "snippet-master"));
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
        notify(__("Invalid import file.", "snippet-master"), "error");
        return;
      }
      importMutation.mutate(snippets);
    } catch (err) {
      notify(__("Could not read the import file.", "snippet-master"), "error");
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
          {__("Failed to load snippets: ", "snippet-master")} {error.message}
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
              {__("Import", "snippet-master")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download />
                  {__("Export", "snippet-master")}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport([], "json")}>
                  {__("Export all (JSON)", "snippet-master")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport([], "php")}>
                  {__("Export all PHP (.php)", "snippet-master")}
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
                    aria-label={__("Select all snippets", "snippet-master")}
                  />
                </TableHead>
                <TableHead>{__("Snippet", "snippet-master")}</TableHead>
                <TableHead>{__("Language", "snippet-master")}</TableHead>
                <TableHead>{__("Scope", "snippet-master")}</TableHead>
                <TableHead>{__("Priority", "snippet-master")}</TableHead>
                <TableHead>{__("Status", "snippet-master")}</TableHead>
                <TableHead>{__("Updated", "snippet-master")}</TableHead>
                <TableHead className="text-right">
                  {__("Actions", "snippet-master")}
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
                        aria-label={__("Select snippet", "snippet-master")}
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
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isActive(snippet.active)}
                          aria-label={__(
                            "Toggle snippet status",
                            "snippet-master"
                          )}
                          onCheckedChange={() =>
                            statusToggler({
                              id: snippet.id,
                              active: snippet.active
                            })
                          }
                        />
                        <span
                          className={cn(
                            "text-xs",
                            isActive(snippet.active)
                              ? "font-medium text-emerald-600"
                              : "text-muted-foreground"
                          )}
                        >
                          {isActive(snippet.active)
                            ? __("Active", "snippet-master")
                            : __("Inactive", "snippet-master")}
                        </span>
                      </div>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={__("Duplicate snippet", "snippet-master")}
                          onClick={() => duplicateMutation.mutate(snippet.id)}
                        >
                          <Copy />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={__("Edit snippet", "snippet-master")}
                          onClick={() => editSnippet(Number(snippet.id))}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          aria-label={__("Delete snippet", "snippet-master")}
                          onClick={() => deleteSnippet(Number(snippet.id))}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex justify-center py-10">
                      <p className="text-muted-foreground">
                        {__("No snippets found", "snippet-master")}
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
