import { ENDPOINTS } from "./endpoints";
import apiFetch from "@wordpress/api-fetch";
import { ccsnptScriptData } from "./../utils/global";
import { buildQueryString } from "./../utils/queryUtils";
import {
  AddNew,
  BulkStatusParams,
  ExportParams,
  ExportResponse,
  GetSnippetsResponse,
  ImportResponse,
  SnippetExport,
  SnippetParams,
  TagsResponse,
  UpdateStatusParams,
  ValidateResponse
} from "./../types/index";

const nonceHeader = () => ({
  "X-WP-Nonce": ccsnptScriptData.ccsnptRestApiNonce
});

export const addNewSnippet = async (addNewData: AddNew) => {
  return apiFetch({
    path: ENDPOINTS.AddNew,
    method: "POST",
    headers: {
      "X-WP-Nonce": ccsnptScriptData.ccsnptRestApiNonce
    },
    data: addNewData
  }).then((res) => res);
};

export const getSnippets = async (
  params: SnippetParams
): Promise<GetSnippetsResponse> => {
  const queryString = buildQueryString(params ? params : "");

  return apiFetch({
    path: `${ENDPOINTS.GetSnippets}?${queryString}`,
    method: "GET",
    headers: {
      "X-WP-Nonce": ccsnptScriptData.ccsnptRestApiNonce
    }
  }).then((res) => {
    return res as GetSnippetsResponse;
  });
};

export const updateStatusSnippets = async (data: UpdateStatusParams) => {
  return apiFetch({
    path: ENDPOINTS.UpdateStatusSnippets,
    method: "POST",
    headers: {
      "X-WP-Nonce": ccsnptScriptData.ccsnptRestApiNonce
    },
    data: data
  }).then((res) => res);
};

export const deleteSnippets = async (ids: (string | number)[]) => {
  return apiFetch({
    path: ENDPOINTS.DeleteSnippets,
    method: "POST",
    headers: {
      "X-WP-Nonce": ccsnptScriptData.ccsnptRestApiNonce
    },
    data: ids
  }).then((res) => res);
};

export const validateSnippet = async (data: {
  codesnippet: string;
  lang: string;
}): Promise<ValidateResponse> => {
  return apiFetch({
    path: ENDPOINTS.ValidateSnippet,
    method: "POST",
    headers: {
      "X-WP-Nonce": ccsnptScriptData.ccsnptRestApiNonce
    },
    data
  }).then((res) => res as ValidateResponse);
};

export const duplicateSnippet = async (id: string | number) => {
  return apiFetch({
    path: ENDPOINTS.DuplicateSnippet,
    method: "POST",
    headers: nonceHeader(),
    data: { id }
  }).then((res) => res);
};

export const bulkUpdateStatus = async (data: BulkStatusParams) => {
  return apiFetch({
    path: ENDPOINTS.BulkStatus,
    method: "POST",
    headers: nonceHeader(),
    data
  }).then((res) => res);
};

export const exportSnippets = async (
  data: ExportParams
): Promise<ExportResponse> => {
  return apiFetch({
    path: ENDPOINTS.ExportSnippets,
    method: "POST",
    headers: nonceHeader(),
    data
  }).then((res) => res as ExportResponse);
};

export const importSnippets = async (
  snippets: SnippetExport[]
): Promise<ImportResponse> => {
  return apiFetch({
    path: ENDPOINTS.ImportSnippets,
    method: "POST",
    headers: nonceHeader(),
    data: { snippets }
  }).then((res) => res as ImportResponse);
};

export const getTags = async (): Promise<TagsResponse> => {
  return apiFetch({
    path: ENDPOINTS.GetTags,
    method: "GET",
    headers: nonceHeader()
  }).then((res) => res as TagsResponse);
};
