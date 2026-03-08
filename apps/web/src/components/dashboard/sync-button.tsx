"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";

export function SyncButton() {
  const queryClient = useQueryClient();
  const { data: status } = useQuery(trpc.sync.getStatus.queryOptions());

  const mutation = useMutation(
    trpc.sync.importSubscriptions.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.subscriptions.list.queryOptions());
        queryClient.invalidateQueries(trpc.analytics.overview.queryOptions());
        queryClient.invalidateQueries(trpc.sync.getStatus.queryOptions());
        toast.success(`Synced ${data.total} subscriptions`);
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const lastSync = status?.lastSyncAt;

  return (
    <div className="flex items-center gap-3">
      {lastSync && (
        <span className="text-xs text-muted-foreground hidden sm:block">
          Last sync: {new Date(lastSync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="h-8 gap-1.5 text-xs"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={mutation.isPending ? "animate-spin" : ""}>
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
        </svg>
        {mutation.isPending ? "Syncing..." : "Sync"}
      </Button>
    </div>
  );
}
