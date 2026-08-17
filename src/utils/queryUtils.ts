export const buildQueryString = (params: any) => {
  if (!params) return "";

  // Skip null/undefined so cleared filters are omitted from the query rather
  // than serialised as the literal string "undefined" (which the server would
  // treat as a real filter value and match nothing).
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");
};
