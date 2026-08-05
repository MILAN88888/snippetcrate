const BASE_URL = "snippet-master/";

export const ENDPOINTS = {
  AddNew: `${BASE_URL}snippets/save`,
  GetSnippets: `${BASE_URL}snippets/get`,
  UpdateStatusSnippets: `${BASE_URL}snippets/update/status`,
  DeleteSnippets: `${BASE_URL}snippets/delete`,
  ValidateSnippet: `${BASE_URL}snippets/validate`,
  DuplicateSnippet: `${BASE_URL}snippets/duplicate`,
  BulkStatus: `${BASE_URL}snippets/bulk/status`,
  ExportSnippets: `${BASE_URL}snippets/export`,
  ImportSnippets: `${BASE_URL}snippets/import`,
  GetTags: `${BASE_URL}snippets/tags`
};
