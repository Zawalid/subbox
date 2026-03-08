"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";
import { CheckSquare, Sparkles, Trash2 } from "lucide-react";

import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

type CleanupItem = {
  id: string;
  channel: { name: string; thumbnail?: string | null; subscriberCount?: string | null };
  lastVideoDate?: string | Date | null;
};

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function ChannelRow({
  item, selected, onToggle,
}: {
  item: CleanupItem;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const lastDate = item.lastVideoDate
    ? new Date(item.lastVideoDate).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
    : "Unknown";

  return (
    <div
      onClick={() => onToggle(item.id)}
      className={cn(
        "flex items-center gap-4 px-5 py-3 transition-colors group cursor-pointer select-none",
        selected ? "bg-destructive/5" : "hover:bg-accent"
      )}
    >
      <div
        className={cn(
          "h-4 w-4 rounded border transition-colors shrink-0 flex items-center justify-center pointer-events-none",
          selected
            ? "bg-destructive border-destructive text-white"
            : "border-border opacity-0 group-hover:opacity-100"
        )}
      >
        {selected && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current">
            <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {item.channel.thumbnail ? (
        <img src={item.channel.thumbnail} alt={item.channel.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
      ) : (
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
          {item.channel.name[0]?.toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate">{item.channel.name}</p>
        <p className="text-xs text-muted-foreground">Last upload: {lastDate}</p>
      </div>

      {item.channel.subscriberCount && (
        <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
          {fmtNum(Number(item.channel.subscriberCount))} subs
        </span>
      )}
    </div>
  );
}

function Section({
  title, badge, badgeCn, items, selected, onToggle,
}: {
  title: string;
  badge: string;
  badgeCn: string;
  items: CleanupItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <motion.div variants={fadeUp}>
      <div className="flex items-center gap-3 mb-3">
        <span className={cn("text-lg font-bold tracking-tight", badgeCn)}>{title}</span>
        <span className="text-xs text-muted-foreground font-medium">{badge}</span>
      </div>
      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
        {items.map(item => (
          <ChannelRow key={item.id} item={item} selected={selected.has(item.id)} onToggle={onToggle} />
        ))}
      </div>
    </motion.div>
  );
}

export function CleanupTool() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(trpc.analytics.cleanupCandidates.queryOptions());
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const bulkDelete = useMutation(
    trpc.subscriptions.bulkDelete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.subscriptions.list.queryOptions());
        queryClient.invalidateQueries(trpc.analytics.overview.queryOptions());
        queryClient.invalidateQueries(trpc.analytics.cleanupCandidates.queryOptions());
        setSelected(new Set());
        setConfirmOpen(false);
        toast.success("Subscriptions removed");
      },
      onError: (e) => {
        setConfirmOpen(false);
        toast.error(e.message);
      },
    })
  );

  const dormant  = data?.dormant  ?? [];
  const inactive = data?.inactive ?? [];
  const allItems = [...dormant, ...inactive];

  const toggleItem = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    setSelected(selected.size === allItems.length ? new Set() : new Set(allItems.map(i => i.id)));
  };

  return (
    <>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-4 px-6 lg:px-10 py-8"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Cleanup</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Remove channels you no longer watch
            </p>
          </div>

          {!isLoading && allItems.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={toggleAll}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                {selected.size === allItems.length ? "Deselect all" : "Select all"}
              </button>
              {selected.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setConfirmOpen(true)}
                  className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove {selected.size}
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <motion.div variants={fadeUp} className="space-y-2">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 rounded-xl border border-border bg-card">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-44" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : allItems.length === 0 ? (
          <motion.div variants={fadeUp}>
            <div className="rounded-xl border border-dashed border-border p-14 text-center">
              <div className="h-12 w-12 rounded-xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1.5">Library is clean</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                All your channels have uploaded recently. Nothing to remove.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            <Section
              title="Dormant"
              badge={`${dormant.length} channels · 12+ months`}
              badgeCn="text-red-500"
              items={dormant}
              selected={selected}
              onToggle={toggleItem}
            />
            <Section
              title="Inactive"
              badge={`${inactive.length} channels · 6–12 months`}
              badgeCn="text-yellow-500"
              items={inactive}
              selected={selected}
              onToggle={toggleItem}
            />
          </>
        )}
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Remove ${selected.size} ${selected.size === 1 ? "channel" : "channels"}?`}
        description={
          <>
            This will permanently remove{" "}
            <strong>{selected.size} {selected.size === 1 ? "subscription" : "subscriptions"}</strong>{" "}
            from your library. This action cannot be undone.
          </>
        }
        confirmLabel="Remove"
        variant="destructive"
        isPending={bulkDelete.isPending}
        onConfirm={() => bulkDelete.mutate({ ids: Array.from(selected) })}
      />
    </>
  );
}
