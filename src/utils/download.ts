import { ExportResponse } from "./../types/index";

export const downloadExport = (res: ExportResponse) => {
  const blob =
    res.format === "php"
      ? new Blob([res.content], { type: "text/plain" })
      : new Blob([JSON.stringify(res.snippets, null, 2)], {
          type: "application/json"
        });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = res.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
