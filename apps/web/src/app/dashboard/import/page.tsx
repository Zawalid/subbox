"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  Download,
  FileDown,
  RefreshCw,
} from "lucide-react";

import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, when: "beforeChildren" } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function ImportPage() {
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const { data: syncStatus } = useQuery(trpc.sync.getStatus.queryOptions());

  const importMutation = useMutation(
    trpc.sync.importSubscriptions.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.subscriptions.list.queryOptions());
        queryClient.invalidateQueries(trpc.analytics.overview.queryOptions());
        queryClient.invalidateQueries(trpc.sync.getStatus.queryOptions());
        toast.success(`Imported ${data.total} subscriptions — ${data.newCount} new`);
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await queryClient.fetchQuery(trpc.subscriptions.export.queryOptions());
      const csv = [
        ["Channel ID", "Channel Name", "Subscribed At", "Status", "Favorite", "Notes", "Categories"].join(","),
        ...rows.map(r => [
          r.youtubeChannelId,
          `"${r.channelName}"`,
          r.subscribedAt ?? "",
          r.status,
          String(r.isFavorite),
          `"${r.notes ?? ""}"`,
          `"${r.categories.join(";")}"`
        ].join(","))
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `subbox-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported successfully");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const lastSync    = syncStatus?.lastSyncAt ? new Date(syncStatus.lastSyncAt) : null;
  const totalSynced = syncStatus?.totalSynced ?? 0;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 px-6 lg:px-10 py-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-[28px] font-bold tracking-tight">Import</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Sync subscriptions from YouTube or export your data</p>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">

        {/* ── Import card ── */}
        <motion.div variants={fadeUp}>
          <div className="rounded-xl border border-border bg-card overflow-hidden h-full flex flex-col">

            {/* Card header */}
            <div className="px-5 h-10 border-b border-border flex items-center">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Import from YouTube
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4">
              {/* YouTube logo */}
              <div className="flex items-center gap-3">
                <img
                  src="https://svgl.app/library/youtube.svg"
                  alt="YouTube"
                  className="h-8 w-auto"
                  draggable={false}
                />
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Connect your Google account to import all your YouTube subscriptions with channel details, upload frequency, and activity status.
              </p>

              {lastSync && (
                <div className="rounded-lg border border-border bg-bg-subtle p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-xs font-medium">{totalSynced} subscriptions synced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      Last sync: {lastSync.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => importMutation.mutate()}
                disabled={importMutation.isPending}
                className={cn(
                  "flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-xs font-medium transition-colors w-full",
                  importMutation.isPending
                    ? "bg-primary/70 text-primary-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {importMutation.isPending ? (
                  <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Importing...</>
                ) : (
                  <><ArrowDownToLine className="h-3.5 w-3.5" />{lastSync ? "Re-sync subscriptions" : "Import subscriptions"}</>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Export card ── */}
        <motion.div variants={fadeUp}>
          <div className="rounded-xl border border-border bg-card overflow-hidden h-full flex flex-col">

            {/* Card header */}
            <div className="px-5 h-10 border-b border-border flex items-center">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Export to CSV
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="h-8 w-8 rounded-lg bg-bg-elevated flex items-center justify-center">
                <FileDown className="h-4 w-4 text-muted-foreground" />
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Download all your subscription data as a CSV file — channel info, categories, status, and notes included.
              </p>

              <div className="rounded-lg border border-border bg-bg-subtle p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Includes</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Channel ID", "Name", "Status", "Subscribed At", "Last upload", "Categories", "Notes"].map(field => (
                    <span key={field} className="text-[11px] px-1.5 py-0.5 rounded bg-bg-overlay text-muted-foreground font-mono">
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors disabled:opacity-50 w-full"
              >
                {exporting ? (
                  <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Exporting...</>
                ) : (
                  <><Download className="h-3.5 w-3.5" />Export CSV</>
                )}
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── How it works ── */}
      <motion.div variants={fadeUp}>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 h-10 border-b border-border flex items-center">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">How it works</span>
          </div>
          <div className="grid sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {[
              { step: "01", text: "Click import — you'll be redirected to Google to authorize." },
              { step: "02", text: "We fetch all your YouTube subscriptions and channel metadata." },
              { step: "03", text: "Channels are analyzed for activity status and upload frequency." },
              { step: "04", text: "Re-sync anytime to update your library with new subscriptions." },
            ].map(({ step, text }) => (
              <div key={step} className="p-4 flex gap-3">
                <span className="font-mono text-[11px] text-primary font-bold shrink-0 mt-0.5">{step}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
