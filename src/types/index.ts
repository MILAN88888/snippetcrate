import type React from "react";

export type ccsnptScriptDataType = {
  adminURL: string;
  siteURL: string;
  ccsnptRestApiNonce: string;
  rootApiUrl: string;
  restURL: string;
  version: string;
};

export type AddNew = {
  id: number | string;
  title: string;
  codesnippet: string;
  priority: number;
  description: string;
  tags: string;
  active: boolean | number;
  scope?: string;
  lang?: string;
};

export type UpdateStatusParams = {
  id: number | string;
  active: boolean | number;
};

export type ValidateResponse = {
  valid: boolean;
  message: string | null;
  line: number | null;
};

export type SyntaxError = {
  message: string;
  line: number;
  column: number;
};

export type Snippet = {
  id: number | string;
  title: string;
  description: string;
  codesnippet: string;
  tags: string;
  scope?: string;
  lang?: string;
  priority: number;
  active: boolean | number | string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
};

export type BackendErrors = {
	[key: string]: string;
  };

  export type SnippetParams = {
    id?: number | string;
    searchByItem?: string;
    startDate?: string;
    endDate?: string;
    offset?: number;
    limit?: number;
    status?: string | number;
    tag?: string;
    lang?: string;
  };

export type SnippetExport = {
  title: string;
  lang: string;
  description: string;
  codesnippet: string;
  tags: string;
  scope: string;
  priority: number;
};

export type ExportParams = {
  ids?: (string | number)[];
  format: "json" | "php";
};

export type ExportResponse =
  | { format: "json"; filename: string; snippets: SnippetExport[] }
  | { format: "php"; filename: string; content: string };

export type ImportResponse = {
  message: string;
  imported: number;
  skipped: number;
};

export type BulkStatusParams = {
  ids: (string | number)[];
  active: number;
};

export type TagsResponse = { tags: string[] };

export type SnippetPagiProps = {
  params: SnippetParams;
  setParams: React.Dispatch<React.SetStateAction<SnippetParams>>;
  totalPages: number;
};

export type GetSnippetsResponse = {
  results: Snippet[];
  total_count: number;
};

export type BulkActionProps = {
  bulkIds: (string | number)[];
  setBulkIds: (value: (string | number)[]) => void;
  setIsCheckAll: (value: boolean) => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onExport: () => void;
  onDelete: () => void;
  isBusy?: boolean;
};
