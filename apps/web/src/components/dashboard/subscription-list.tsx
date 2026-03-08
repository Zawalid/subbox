"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  PlaySquare,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type StatusFilter = "" | "active" | "inactive" | "dormant";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const STATUS_LABEL: Record<string, string> = {
  "":       "All",
  active:   "Active",
  inactive: "Inactive",
  dormant:  "Dormant",
};

const STATUS_BADGE: Record<string, string> = {
  active:   "bg-green-500/10 text-green-500",
  inactive: "bg-yellow-500/10 text-yellow-500",
  dormant:  "bg-red-500/10 text-red-500",
};

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function relDate(val: string | Date | null): string {
  if (!val) return "No uploads";
  const diff = Math.floor((Date.now() - new Date(val).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)   return `${diff}d ago`;
  if (diff < 30)  return `${Math.floor(diff / 7)}w ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}

export function SubscriptionList() {
  const queryClient = useQueryClient();
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState<StatusFilter>("");
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading } = useQuery(
    trpc.subscriptions.list.queryOptions({
      search: search || undefined,
      status: statusFilter || undefined,
      limit: 200,
    })
  );

  const bulkDelete = useMutation(
    trpc.subscriptions.bulkDelete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.subscriptions.list.queryOptions());
        queryClient.invalidateQueries(trpc.analytics.overview.queryOptions());
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

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const toggleItem = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    setSelected(
      selected.size === items.length ? new Set() : new Set(items.map(i => i.id))
    );
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 px-6 lg:px-10 py-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading..." : `${total.toLocaleString()} channels in your library`}
          </p>
        </div>

        {selected.size > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-2 h-8 px-3.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove {selected.size}
          </motion.button>
        )}
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search channels..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-card border-border"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
          {(["", "active", "inactive", "dormant"] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "h-7 px-3 rounded-md text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>

      </motion.div>

      {/* List */}
      <motion.div variants={fadeUp}>
        {isLoading ? (
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Table head */}
            <div className="flex items-center gap-4 px-5 py-2.5 border-b border-border bg-muted/30">
              <button
                onClick={toggleAll}
                className={cn(
                  "h-4 w-4 rounded border transition-colors shrink-0 flex items-center justify-center",
                  selected.size === items.length && items.length > 0
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                )}
              >
                {selected.size === items.length && items.length > 0 && (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
              <span className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary font-medium flex-1">
                Channel
              </span>
              <span className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary font-medium w-24 hidden sm:block">
                Last upload
              </span>
              <span className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary font-medium w-20 hidden lg:block">
                Subscribers
              </span>
              <span className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary font-medium w-20">
                Status
              </span>
              <span className="w-5 shrink-0" />
            </div>

            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3 transition-colors group cursor-pointer select-none",
                    i < items.length - 1 && "border-b border-border",
                    selected.has(item.id) ? "bg-primary/5" : "hover:bg-accent"
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "h-4 w-4 rounded border transition-colors shrink-0 flex items-center justify-center pointer-events-none",
                      selected.has(item.id)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {selected.has(item.id) && (
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>

                  {/* Thumbnail */}
                  {item.channel.thumbnail ? (
                    <img
                      src={item.channel.thumbnail}
                      alt={item.channel.name}
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {item.channel.name[0]?.toUpperCase()}
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-medium truncate">{item.channel.name}</p>
                      {item.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                    </div>
                  </div>

                  {/* Last upload */}
                  <span className="text-xs text-muted-foreground w-24 hidden sm:block shrink-0">
                    {relDate(item.lastVideoDate)}
                  </span>

                  {/* Subscribers */}
                  <span className="text-xs text-muted-foreground w-20 hidden lg:block shrink-0">
                    {item.channel.subscriberCount
                      ? fmtNum(Number(item.channel.subscriberCount))
                      : "—"}
                  </span>

                  {/* Status */}
                  <span className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize w-20 text-center shrink-0",
                    STATUS_BADGE[item.status] ?? "bg-muted text-muted-foreground"
                  )}>
                    {item.status}
                  </span>

                  {/* Arrow — stops row toggle, navigates to detail */}
                  <Link
                    href={`/dashboard/channels/${item.id}` as Route}
                    onClick={e => e.stopPropagation()}
                    className="h-5 w-5 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:text-foreground"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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
    </motion.div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-14 text-center">
      <div className="h-12 w-12 rounded-xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
        <PlaySquare className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium mb-1.5">
        {search ? `No channels match "${search}"` : "No subscriptions yet"}
      </p>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
        {search
          ? "Try a different search term or clear the filter."
          : "Import your YouTube subscriptions to get started."}
      </p>
    </div>
  );
}
