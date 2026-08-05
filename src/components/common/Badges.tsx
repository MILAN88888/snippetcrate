import React from "react";
import { Badge } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";

const langMeta: Record<string, { label: string; color: string }> = {
  PHP: { label: "PHP", color: "purple" },
  JS: { label: "JavaScript", color: "yellow" },
  CSS: { label: "CSS", color: "blue" },
  HTML: { label: "HTML", color: "orange" }
};

const scopeColor: Record<string, string> = {
  global: "blue",
  header: "green",
  footer: "orange",
  shortcode: "cyan"
};

const normalizeLang = (lang?: string): string => {
  const value = (lang ?? "PHP").toString().toUpperCase();
  return langMeta[value] ? value : "PHP";
};

export const LanguageBadge: React.FC<{ lang?: string }> = ({ lang }) => {
  const meta = langMeta[normalizeLang(lang)];
  return <Badge colorScheme={meta.color}>{meta.label}</Badge>;
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
