import React from "react";
import { __ } from "@wordpress/i18n";
import { Badge } from "@/components/ui/badge";

type BadgeVariant =
  | "blue"
  | "purple"
  | "yellow"
  | "orange"
  | "green"
  | "gray"
  | "cyan";

const langMeta: Record<string, { label: string; variant: BadgeVariant }> = {
  PHP: { label: "PHP", variant: "blue" },
  JS: { label: "JavaScript", variant: "yellow" },
  CSS: { label: "CSS", variant: "blue" },
  HTML: { label: "HTML", variant: "orange" }
};

const scopeVariant: Record<string, BadgeVariant> = {
  global: "gray",
  header: "gray",
  footer: "gray",
  shortcode: "gray"
};

const normalizeLang = (lang?: string): string => {
  const value = (lang ?? "PHP").toString().toUpperCase();
  return langMeta[value] ? value : "PHP";
};

export const LanguageBadge: React.FC<{ lang?: string }> = ({ lang }) => {
  const meta = langMeta[normalizeLang(lang)];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
};

export const ScopeBadge: React.FC<{ scope?: string }> = ({ scope }) => {
  const value = (scope ?? "global").toString().toLowerCase();
  return <Badge variant={scopeVariant[value] ?? "gray"}>{value}</Badge>;
};

export const StatusBadge: React.FC<{ active?: boolean }> = ({ active }) => (
  <Badge variant={active ? "green" : "gray"}>
    {active ? __("Active", "snippetcrate") : __("Inactive", "snippetcrate")}
  </Badge>
);
