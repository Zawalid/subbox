"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Download,
  PlaySquare,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ── Motion helpers ────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(name: string) {
  const h = new Date().getHours();
  const tod = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${tod}, ${name}`;
}

function relativeDate(val: string | Date | null): string {
  if (!val) return "No uploads";
  const diff = Math.floor((Date.now() - new Date(val).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)   return `${diff}d ago`;
  if (diff < 30)  return `${Math.floor(diff / 7)}w ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function DashboardOverview() {
  const { data: session } = authClient.useSession();
  const { data: stats, isLoading: statsLoading } = useQuery(
    trpc.analytics.overview.queryOptions()
  );
  const { data: subsData, isLoading: subsLoading } = useQuery(
    trpc.subscriptions.list.queryOptions({ limit: 8, sortOrder: "desc" })
  );

  const firstName = session?.user.name?.split(" ")[0] ?? "there";
  const total    = stats?.total    ?? 0;
  const active   = stats?.active   ?? 0;
  const inactive = stats?.inactive ?? 0;
  const dormant  = stats?.dormant  ?? 0;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const activePct   = pct(active);
  const inactivePct = pct(inactive);
  const dormantPct  = pct(dormant);

  const recentSubs = subsData?.items ?? [];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 px-6 lg:px-10 py-8"
    >

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {getGreeting(firstName)}
          </p>
        </div>
        <Link
          href={"/dashboard/import" as Route}
          className="flex items-center gap-2 h-8 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shrink-0 mt-1"
        >
          <Download className="h-3.5 w-3.5" />
          Import
        </Link>
      </motion.div>

      {/* ── Stats hero card ── */}
      <motion.div variants={fadeUp}>
        {statsLoading ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid divide-x divide-border" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="p-5 space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid divide-x divide-border" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {/* Total */}
              <div className="p-5">
                <p className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary font-medium mb-2">
                  Total
                </p>
                <p className="text-[32px] font-bold tabular-nums leading-none tracking-tight mb-1.5">
                  {total.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  subscriptions
                </p>
              </div>
              {/* Active */}
              <div className="p-5">
                <p className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary font-medium mb-2">
                  Active
                </p>
                <p className="text-[32px] font-bold tabular-nums leading-none tracking-tight mb-1.5 text-green-500">
                  {active.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {activePct}% of library
                </p>
              </div>
              {/* Inactive */}
              <div className="p-5">
                <p className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary font-medium mb-2">
                  Inactive
                </p>
                <p className={cn(
                  "text-[32px] font-bold tabular-nums leading-none tracking-tight mb-1.5",
                  inactive > 0 ? "text-yellow-500" : ""
                )}>
                  {inactive.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">6+ months quiet</p>
              </div>
              {/* Dormant */}
              <div className="p-5">
                <p className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary font-medium mb-2">
                  Dormant
                </p>
                <p className={cn(
                  "text-[32px] font-bold tabular-nums leading-none tracking-tight mb-1.5",
                  dormant > 0 ? "text-red-500" : ""
                )}>
                  {dormant.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">12+ months quiet</p>
              </div>
            </div>

            {/* Activity bar */}
            <div className="px-5 py-3 border-t border-border flex items-center gap-4">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden flex">
                {total > 0 && (
                  <>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${activePct}%` }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-green-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${inactivePct}%` }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                      className="h-full bg-yellow-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dormantPct}%` }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                      className="h-full bg-red-500"
                    />
                  </>
                )}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {activePct}% active
              </span>
              <Link
                href={"/dashboard/analytics" as Route}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                Details <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Bottom grid: recent + actions ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Recent channels */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Recently added</p>
              <p className="text-xs text-muted-foreground">Latest channels in your library</p>
            </div>
            <Link
              href={"/dashboard/channels" as Route}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {subsLoading ? (
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentSubs.length === 0 ? (
            <EmptyChannels />
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              {recentSubs.map((sub, i) => (
                <ChannelRow
                  key={sub.id}
                  sub={sub}
                  isLast={i === recentSubs.length - 1}
                  relDate={relativeDate(sub.lastVideoDate)}
                  fmtSubs={sub.channel.subscriberCount ? fmtNum(Number(sub.channel.subscriberCount)) : null}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} className="flex flex-col gap-2">
          <p className="text-sm font-semibold mb-1">Quick actions</p>
          <QuickAction
            href="/dashboard/cleanup"
            icon={<Trash2 className="h-4 w-4 text-red-400" />}
            title="Cleanup"
            sub={dormant > 0 ? `${dormant} dormant channels` : "Library is healthy"}
            badge={dormant || undefined}
            badgeCn="bg-red-500/15 text-red-400"
          />
          <QuickAction
            href="/dashboard/categories"
            icon={<Tag className="h-4 w-4 text-blue-400" />}
            title="Categories"
            sub="Organise your library"
          />
          <QuickAction
            href="/dashboard/analytics"
            icon={<BarChart3 className="h-4 w-4 text-violet-400" />}
            title="Analytics"
            sub="Posting patterns & trends"
          />
          <QuickAction
            href="/dashboard/import"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            title="Import"
            sub="Add from YouTube"
          />
        </motion.div>
      </div>

    </motion.div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function QuickAction({
  href, icon, title, sub, badge, badgeCn,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  badge?: number;
  badgeCn?: string;
}) {
  return (
    <Link
      href={href as Route}
      className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-accent transition-colors group"
    >
      <div className="h-8 w-8 rounded-lg bg-bg-overlay flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge !== undefined && (
          <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-md tabular-nums", badgeCn)}>
            {badge}
          </span>
        )}
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

type SubItem = {
  id: string;
  status: string;
  isFavorite: boolean | null;
  lastVideoDate: string | null;
  channel: {
    name: string;
    thumbnail: string | null;
    subscriberCount: string | null;
  };
};

function ChannelRow({
  sub, isLast, relDate, fmtSubs,
}: {
  sub: SubItem;
  isLast: boolean;
  relDate: string;
  fmtSubs: string | null;
}) {
  const statusCn: Record<string, string> = {
    active:   "bg-green-500/10 text-green-500",
    inactive: "bg-yellow-500/10 text-yellow-500",
    dormant:  "bg-red-500/10 text-red-500",
  };

  return (
    <Link
      href={"/dashboard/channels" as Route}
      className={cn(
        "flex items-center gap-4 px-4 py-3 hover:bg-accent transition-colors group",
        !isLast && "border-b border-border"
      )}
    >
      {sub.channel.thumbnail ? (
        <img
          src={sub.channel.thumbnail}
          alt={sub.channel.name}
          className="h-9 w-9 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {sub.channel.name[0]?.toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate">{sub.channel.name}</p>
        <p className="text-xs text-muted-foreground">
          {relDate}
          {fmtSubs && <> · {fmtSubs} subs</>}
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {sub.isFavorite && <span className="text-yellow-500 text-xs">★</span>}
        <span className={cn(
          "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
          statusCn[sub.status] ?? "bg-muted text-muted-foreground"
        )}>
          {sub.status}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

function EmptyChannels() {
  return (
    <div className="rounded-xl border border-dashed border-border p-14 text-center">
      <div className="h-12 w-12 rounded-xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
        <PlaySquare className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium mb-1.5">No subscriptions yet</p>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-5">
        Import your YouTube subscriptions to start organizing your library.
      </p>
      <Link
        href={"/dashboard/import" as Route}
        className="inline-flex items-center gap-2 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Import subscriptions
      </Link>
    </div>
  );
}
