"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { InboxIcon } from "lucide-react";

import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ── Motion ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, when: "beforeChildren" } },
};

// ── Data helpers ──────────────────────────────────────────────────────────

type MonthBucket = {
  date: string;
  active: number;
  inactive: number;
  dormant: number;
  total: number;
};

function buildMonthlyData(
  items: Array<{ lastVideoDate: string | null; status: string }>
): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      date: d.toLocaleDateString("en", { month: "short" }),
      active: 0,
      inactive: 0,
      dormant: 0,
      total: 0,
    });
  }

  for (const item of items) {
    if (!item.lastVideoDate) continue;
    const d  = new Date(item.lastVideoDate);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const idx = buckets.findIndex((_, i) => {
      const ref = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return ref.getFullYear() === yr && ref.getMonth() === mo;
    });
    if (idx === -1) continue;
    const bucket = buckets[idx]!;
    bucket.total++;
    if (item.status === "active")   bucket.active++;
    else if (item.status === "inactive") bucket.inactive++;
    else if (item.status === "dormant")  bucket.dormant++;
  }

  return buckets;
}

// ── Tooltip ───────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const visible = payload.filter(e => (e.value ?? 0) > 0);
  if (!visible.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2.5 shadow-xl shadow-black/30 text-xs min-w-[130px]"
      style={{ backgroundColor: "var(--bg-tooltip)" }}
    >
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
        {label}
      </p>
      {visible.map(entry => (
        <div key={entry.name} className="flex items-center justify-between gap-5 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}</span>
          </div>
          <span className="font-medium tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Legend row ────────────────────────────────────────────────────────────

function LegendRow({
  color, label, value, pct, isLast,
}: {
  color: string; label: string; value: number; pct: number; isLast: boolean;
}) {
  return (
    <div className={cn("px-5 py-3 flex items-center gap-3", !isLast && "border-b border-border/50")}>
      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-sm flex-1 capitalize">{label}</span>
      <span className="tabular-nums text-sm text-muted-foreground w-10 text-right">
        {value.toLocaleString()}
      </span>
      <span className="tabular-nums text-sm font-medium w-12 text-right">{pct}%</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery(trpc.analytics.overview.queryOptions());
  const { data: subsData, isLoading: subsLoading } = useQuery(
    trpc.subscriptions.list.queryOptions({ limit: 200 })
  );

  const total    = data?.total    ?? 0;
  const active   = data?.active   ?? 0;
  const inactive = data?.inactive ?? 0;
  const dormant  = data?.dormant  ?? 0;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const activePct   = pct(active);
  const inactivePct = pct(inactive);
  const dormantPct  = pct(dormant);

  const monthlyData = useMemo(
    () => buildMonthlyData(subsData?.items ?? []),
    [subsData]
  );

  const hasChartData = monthlyData.some(m => m.total > 0);

  // Data for the radial/donut chart (status snapshot)
  const radialData = [
    { name: "Active",   value: activePct,   fill: "#22c55e" },
    { name: "Inactive", value: inactivePct, fill: "#eab308" },
    { name: "Dormant",  value: dormantPct,  fill: "#ef4444" },
  ].filter(d => d.value > 0);

  const statusLegend = [
    { color: "#22c55e", label: "Active",   value: active,   pct: activePct },
    { color: "#eab308", label: "Inactive", value: inactive, pct: inactivePct },
    { color: "#ef4444", label: "Dormant",  value: dormant,  pct: dormantPct },
  ];

  // ── Loading ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4 px-6 lg:px-10 py-8">
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-[340px] rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────

  if (total === 0) {
    return (
      <div className="space-y-4 px-6 lg:px-10 py-8">
        <h1 className="text-[28px] font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Subscription health overview</p>
        <div className="rounded-xl border bg-card flex flex-col items-center justify-center min-h-[320px] text-center px-6">
          <InboxIcon className="h-10 w-10 mb-4 text-muted-foreground/30" />
          <p className="text-base font-bold mb-1.5">No data yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Import your YouTube subscriptions to see analytics here.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 px-6 lg:px-10 py-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-[28px] font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Subscription health overview</p>
      </motion.div>

      {/* ── Main card — Area chart ─────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="rounded-xl border bg-card overflow-hidden">

          {/* Inline metrics row */}
          <div className="px-6 pt-5 pb-5 flex items-start gap-8 flex-wrap">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Total</p>
              <p className="text-4xl font-bold tabular-nums tracking-tight leading-none">
                {total.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">subscriptions</p>
            </div>

            <div className="h-10 w-px bg-border self-center hidden sm:block" />

            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Active</p>
              <p className="text-4xl font-bold tabular-nums tracking-tight leading-none text-green-500">
                {active.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{activePct}% of library</p>
            </div>

            <div className="h-10 w-px bg-border self-center hidden sm:block" />

            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Inactive</p>
              <p className={cn("text-4xl font-bold tabular-nums tracking-tight leading-none", inactive > 0 ? "text-yellow-500" : "")}>
                {inactive.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">6+ months quiet</p>
            </div>

            <div className="h-10 w-px bg-border self-center hidden sm:block" />

            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Dormant</p>
              <p className={cn("text-4xl font-bold tabular-nums tracking-tight leading-none", dormant > 0 ? "text-red-500" : "")}>
                {dormant.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">12+ months quiet</p>
            </div>

            {/* Legend */}
            <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground self-start pt-1">
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-green-500" />Active</div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-yellow-500" />Inactive</div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-red-500" />Dormant</div>
            </div>
          </div>

          {/* Stacked activity bar */}
          <div className="px-6 pb-5">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
              <motion.div initial={{ width: 0 }} animate={{ width: `${activePct}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="h-full bg-green-500" />
              <motion.div initial={{ width: 0 }} animate={{ width: `${inactivePct}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }} className="h-full bg-yellow-500" />
              <motion.div initial={{ width: 0 }} animate={{ width: `${dormantPct}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} className="h-full bg-red-500" />
            </div>
          </div>

          {/* Area chart — last 12 months upload activity */}
          <div className="border-t border-border">
            {subsLoading ? (
              <div className="p-6"><Skeleton className="h-56 w-full rounded-lg" /></div>
            ) : !hasChartData ? (
              <div className="flex items-center justify-center h-56">
                <p className="text-sm text-muted-foreground">No upload activity data available</p>
              </div>
            ) : (
              <div className="pt-4 pb-2">
                <ResponsiveContainer width="100%" height={224} style={{ outline: "none" }}>
                  <AreaChart data={monthlyData} margin={{ top: 4, right: 48, left: 12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gInactive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#eab308" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gDormant" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                    <YAxis orientation="right" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} allowDecimals={false} width={40} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.07)", strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="active"   name="active"   stroke="#22c55e" strokeWidth={2}   fill="url(#gActive)"   dot={false} activeDot={{ r: 4, fill: "#22c55e",  strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="inactive" name="inactive" stroke="#eab308" strokeWidth={1.5} fill="url(#gInactive)" dot={false} activeDot={{ r: 3, fill: "#eab308",  strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="dormant"  name="dormant"  stroke="#ef4444" strokeWidth={1.5} fill="url(#gDormant)"  dot={false} activeDot={{ r: 3, fill: "#ef4444",  strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* ── Bottom two cards ────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Left — Stacked BarChart by status per month */}
        <motion.div variants={fadeUp} className="h-full">
          <div className="rounded-xl border bg-card overflow-hidden h-full flex flex-col">
            <div className="px-5 pt-5 pb-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">By Status</p>
              <p className={cn("text-3xl font-bold tabular-nums tracking-tight leading-none", activePct < 50 ? "text-red-500" : "text-green-500")}>
                {activePct}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">{active.toLocaleString()} active channels</p>
            </div>

            <div className="pb-2">
              <ResponsiveContainer width="100%" height={140} style={{ outline: "none" }}>
                <BarChart data={monthlyData} margin={{ top: 0, right: 12, left: 12, bottom: 0 }} barSize={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="active"   name="active"   stackId="s" fill="#22c55e" radius={[0,0,0,0]} />
                  <Bar dataKey="inactive" name="inactive" stackId="s" fill="#eab308" radius={[0,0,0,0]} />
                  <Bar dataKey="dormant"  name="dormant"  stackId="s" fill="#ef4444" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-border flex-1">
              {statusLegend.map((item, i) => (
                <LegendRow
                  key={item.label}
                  color={item.color}
                  label={item.label}
                  value={item.value}
                  pct={item.pct}
                  isLast={i === statusLegend.length - 1}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right — RadialBarChart (donut) for snapshot distribution */}
        <motion.div variants={fadeUp} className="h-full">
          <div className="rounded-xl border bg-card overflow-hidden h-full flex flex-col">
            <div className="px-5 pt-5 pb-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                Distribution
              </p>
              <p className="text-3xl font-bold tabular-nums tracking-tight leading-none">
                {total.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">total subscriptions</p>
            </div>

            <div className="flex items-center justify-center pb-2">
              <ResponsiveContainer width="100%" height={140} style={{ outline: "none" }}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="80%"
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={4}
                    label={false}
                  >
                    {radialData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </RadialBar>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border px-3 py-2 shadow-xl shadow-black/30 text-xs" style={{ backgroundColor: "var(--bg-tooltip)" }}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                            <span className="text-muted-foreground">{d.name}</span>
                            <span className="font-medium tabular-nums ml-2">{d.value}%</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-border flex-1">
              {statusLegend.map((item, i) => (
                <LegendRow
                  key={item.label}
                  color={item.color}
                  label={item.label}
                  value={item.value}
                  pct={item.pct}
                  isLast={i === statusLegend.length - 1}
                />
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
