"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsOverview() {
  const { data, isLoading } = useQuery(trpc.analytics.overview.queryOptions());

  const stats = [
    { label: "Total", value: data?.total ?? 0, sub: "subscriptions" },
    { label: "Active", value: data?.active ?? 0, sub: "posted recently", color: "text-green-500" },
    { label: "Inactive", value: data?.inactive ?? 0, sub: "6+ months ago", color: "text-yellow-500" },
    { label: "Dormant", value: data?.dormant ?? 0, sub: "12+ months ago", color: "text-red-500" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ label, value, sub, color }) => (
        <div key={label} className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color ?? ""}`}>{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}
