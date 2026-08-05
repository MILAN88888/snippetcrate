interface ccsnptScriptData {
  adminURL: string;
  siteURL: string;
  ccsnptRestApiNonce: string;
  rootApiUrl: string;
  restURL: string;
  version: string;
}

declare global {
  interface Window {
    ccsnpt_script_data: ccsnptScriptData;
  }
}
