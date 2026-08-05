import React from "react";
import { Badge } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";

const langColor: Record<string, string> = { PHP: "purple", JS: "yellow" };
const scopeColor: Record<string, string> = {
  global: "blue",
  header: "green",
  footer: "orange"
};

const normalizeLang = (lang?: string): string =>
  (lang ?? "PHP").toString().toUpperCase() === "JS" ? "JS" : "PHP";

export const LanguageBadge: React.FC<{ lang?: string }> = ({ lang }) => {
  const value = normalizeLang(lang);
  return (
    <Badge colorScheme={langColor[value]}>
      {value === "JS" ? __("JavaScript", "snippet-master") : __("PHP", "snippet-master")}
    </Badge>
  );
};

export const ScopeBadge: React.FC<{ scope?: string }> = ({ scope }) => {
  const value = (scope ?? "global").toString().toLowerCase();
  return (
    <Badge variant="subtle" colorScheme={scopeColor[value] ?? "gray"}>
      {value}
    </Badge>
  );
};

export const StatusBadge: React.FC<{ active?: boolean }> = ({ active }) => (
  <Badge variant="subtle" colorScheme={active ? "green" : "gray"}>
    {active ? __("Active", "snippet-master") : __("Inactive", "snippet-master")}
  </Badge>
);
