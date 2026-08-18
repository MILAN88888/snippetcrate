import React from "react";
import { __ } from "@wordpress/i18n";
import { useQuery } from "@tanstack/react-query";
import { getSnippets } from "./../../../api/api";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const useCount = (status?: number) =>
  useQuery({
    queryKey: ["snippets", "count", { status }],
    queryFn: async () => {
      const params = status === undefined ? { limit: 1 } : { status, limit: 1 };
      const res = await getSnippets(params);
      return Number(res.total_count) || 0;
    }
  });

const StatCard: React.FC<{
  label: string;
  value?: number;
  loading: boolean;
  valueClassName?: string;
}> = ({ label, value, loading, valueClassName }) => (
  <Card>
    <CardContent className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 text-3xl font-bold text-foreground", valueClassName)}>
        {loading ? "—" : (value ?? 0)}
      </p>
    </CardContent>
  </Card>
);

const SnippetStats: React.FC = () => {
  const total = useCount();
  const active = useCount(1);
  const inactive = useCount(0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label={__("Total Snippets", "custom-code-snippets-manager")}
        value={total.data}
        loading={total.isLoading}
      />
      <StatCard
        label={__("Active", "custom-code-snippets-manager")}
        value={active.data}
        loading={active.isLoading}
        valueClassName="text-emerald-600"
      />
      <StatCard
        label={__("Inactive", "custom-code-snippets-manager")}
        value={inactive.data}
        loading={inactive.isLoading}
      />
    </div>
  );
};

export default SnippetStats;
