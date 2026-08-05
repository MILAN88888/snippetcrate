const BASE_URL = "snippet-master/";

export const ENDPOINTS = {
  AddNew: `${BASE_URL}snippets/save`,
  GetSnippets: `${BASE_URL}snippets/get`,
  UpdateStatusSnippets: `${BASE_URL}snippets/update/status`,
  DeleteSnippets: `${BASE_URL}snippets/delete`,
  ValidateSnippet: `${BASE_URL}snippets/validate`
};
