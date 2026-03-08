"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft,
  Calendar,
  Check,
  Earth,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Plus,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  Video,
  X,
  PlaySquare,
} from "lucide-react";

import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const STATUS_STYLES: Record<string, { label: string; cn: string }> = {
  active:   { label: "Active",   cn: "bg-green-500/10 text-green-500 border border-green-500/20" },
  inactive: { label: "Inactive", cn: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" },
  dormant:  { label: "Dormant",  cn: "bg-red-500/10 text-red-500 border border-red-500/20" },
};

function fmtNum(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function relDate(val: string | Date | null | undefined): string {
  if (!val) return "Unknown";
  const diff = Math.floor((Date.now() - new Date(val).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)   return `${diff}d ago`;
  if (diff < 30)  return `${Math.floor(diff / 7)}w ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}

export default function ChannelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const catPickerRef = useRef<HTMLDivElement>(null);

  const [notes, setNotes]                 = useState("");
  const [notesDirty, setNotesDirty]       = useState(false);
  const [catPickerOpen, setCatPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen]       = useState(false);

  const { data: sub, isLoading } = useQuery(trpc.subscriptions.get.queryOptions({ id }));
  const { data: allCategories = [] } = useQuery(trpc.categories.list.queryOptions());
  const { data: recentVideos = [] } = useQuery(
    trpc.channels.getVideos.queryOptions({ subscriptionId: id })
  );

  useEffect(() => {
    if (sub && !notesDirty) setNotes(sub.notes ?? "");
  }, [sub, notesDirty]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catPickerRef.current && !catPickerRef.current.contains(e.target as Node)) {
        setCatPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const favoriteMutation = useMutation(
    trpc.subscriptions.update.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(trpc.subscriptions.get.queryOptions({ id })),
      onError: (e) => toast.error(e.message),
    })
  );

  const notesMutation = useMutation(
    trpc.subscriptions.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.subscriptions.get.queryOptions({ id }));
        setNotesDirty(false);
        toast.success("Notes saved");
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const deleteMutation = useMutation(
    trpc.subscriptions.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.subscriptions.list.queryOptions());
        toast.success("Subscription removed");
        router.push("/dashboard/channels");
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const assignCatMutation = useMutation(
    trpc.subscriptions.assignCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.subscriptions.get.queryOptions({ id }));
        queryClient.invalidateQueries(trpc.categories.list.queryOptions());
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const removeCatMutation = useMutation(
    trpc.subscriptions.removeCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.subscriptions.get.queryOptions({ id }));
        queryClient.invalidateQueries(trpc.categories.list.queryOptions());
      },
      onError: (e) => toast.error(e.message),
    })
  );

  if (isLoading) {
    return (
      <div className="px-6 lg:px-10 py-8 space-y-6">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-start gap-5">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-px rounded-xl overflow-hidden border border-border">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-[72px]" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="px-6 lg:px-10 py-20 text-center">
        <p className="text-sm text-muted-foreground">Subscription not found.</p>
        <Link href={"/dashboard/channels" as Route} className="mt-3 inline-flex text-xs text-primary hover:underline">
          Back to subscriptions
        </Link>
      </div>
    );
  }

  const channel = sub.channel;
  const statusStyle = STATUS_STYLES[sub.status] ?? { label: sub.status, cn: "bg-muted text-muted-foreground border border-border" };
  const assignedCatIds = new Set(sub.categories.map(c => c.id));
  const unassignedCats = allCategories.filter(c => !assignedCatIds.has(c.id));

  return (
    <>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="px-6 lg:px-10 py-8 space-y-6"
      >
        {/* Breadcrumb */}
        <motion.div variants={fadeUp}>
          <Link
            href={"/dashboard/channels" as Route}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to subscriptions
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div variants={fadeUp} className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-5">
            {channel.thumbnail ? (
              <img
                src={channel.thumbnail}
                alt={channel.name}
                className="h-[72px] w-[72px] rounded-full object-cover shrink-0 ring-2 ring-border"
              />
            ) : (
              <div className="h-[72px] w-[72px] rounded-full bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
                {channel.name[0]?.toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[26px] font-bold tracking-tight leading-none">{channel.name}</h1>
                <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0", statusStyle.cn)}>
                  {statusStyle.label}
                </span>
                {sub.isFavorite && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
              </div>

              {channel.customUrl && (
                <a
                  href={`https://youtube.com/${channel.customUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mt-1.5"
                >
                  {channel.customUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              <div className="flex items-center gap-3 mt-2.5 flex-wrap text-xs text-muted-foreground">
                {channel.subscriberCount && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {fmtNum(Number(channel.subscriberCount))} subscribers
                  </span>
                )}
                {channel.videoCount && (
                  <>
                    <span className="h-3 w-px bg-border" />
                    <span className="flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5" />
                      {Number(channel.videoCount).toLocaleString()} videos
                    </span>
                  </>
                )}
                {channel.viewCount && (
                  <>
                    <span className="h-3 w-px bg-border" />
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      {fmtNum(Number(channel.viewCount))} views
                    </span>
                  </>
                )}
                {channel.country && (
                  <>
                    <span className="h-3 w-px bg-border" />
                    <span className="flex items-center gap-1.5">
                      <Earth className="h-3.5 w-3.5" />
                      {channel.country}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => favoriteMutation.mutate({ id, isFavorite: !sub.isFavorite })}
              disabled={favoriteMutation.isPending}
              className={cn(
                "flex items-center gap-2 h-8 px-3.5 rounded-lg border text-xs font-medium transition-colors",
                sub.isFavorite
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              <Star className={cn("h-3.5 w-3.5", sub.isFavorite && "fill-yellow-500")} />
              {sub.isFavorite ? "Favorited" : "Favorite"}
            </button>

            <a
              href={`https://youtube.com/channel/${channel.youtubeChannelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open on YouTube
            </a>

            <button
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 h-8 px-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </motion.div>

        {/* Metrics bar */}
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
            {[
              {
                label: "Subscribed",
                value: sub.subscribedAt
                  ? new Date(sub.subscribedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
                  : "—",
              },
              {
                label: "Last upload",
                value: sub.lastVideoDate
                  ? new Date(sub.lastVideoDate).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
                  : "—",
                sub: sub.lastVideoDate ? relDate(sub.lastVideoDate) : undefined,
              },
              {
                label: "Upload freq",
                value: sub.uploadFrequency ?? "—",
              },
              {
                label: "Channel since",
                value: channel.publishedAt
                  ? new Date(channel.publishedAt).getFullYear().toString()
                  : "—",
              },
            ].map(({ label, value, sub: subValue }) => (
              <div key={label} className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  {label}
                </p>
                <p className="text-sm font-semibold">{value}</p>
                {subValue && <p className="text-[11px] text-muted-foreground mt-0.5">{subValue}</p>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Body */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-5">

            {/* Recent videos */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlaySquare className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Recent uploads
                  </p>
                </div>
                {recentVideos.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">{recentVideos.length} videos</span>
                )}
              </div>

              {recentVideos.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-xs text-muted-foreground">No recent uploads found.</p>
                  <p className="text-xs text-muted-foreground mt-1">Sync your subscriptions to populate videos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
                  <AnimatePresence initial={false}>
                    {recentVideos.map((video, i) => (
                      <motion.a
                        key={video.id}
                        href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="group bg-card flex flex-col hover:bg-accent transition-colors"
                      >
                        {video.thumbnailUrl ? (
                          <div className="relative aspect-video overflow-hidden">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-200">
                                <PlaySquare className="h-4 w-4 text-black" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            <PlaySquare className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="px-3 py-2.5">
                          <p className="text-[12px] font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {video.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {video.publishedAt ? relDate(video.publishedAt) : "Unknown"}
                          </p>
                        </div>
                      </motion.a>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* About */}
            {channel.description && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  About
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {channel.description}
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Personal notes
                  </p>
                </div>
                <AnimatePresence>
                  {notesDirty && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => notesMutation.mutate({ id, notes })}
                      disabled={notesMutation.isPending}
                      className="flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {notesMutation.isPending
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Check className="h-3 w-3" />
                      }
                      Save
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <Textarea
                value={notes}
                onChange={e => { setNotes(e.target.value); setNotesDirty(true); }}
                placeholder="Add personal notes about this channel..."
                className="min-h-[96px] text-sm resize-none bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:border-none shadow-none placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-4">
            {/* Categories */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Categories
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {sub.categories.length === 0 && (
                  <p className="text-xs text-muted-foreground">No categories assigned</p>
                )}
                {sub.categories.map(cat => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                    style={{ background: cat.color ?? "#6366f1" }}
                  >
                    {cat.name}
                    <button
                      onClick={() => removeCatMutation.mutate({ subscriptionId: id, categoryId: cat.id })}
                      className="hover:opacity-70 transition-opacity ml-0.5"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative" ref={catPickerRef}>
                <button
                  onClick={() => setCatPickerOpen(o => !o)}
                  disabled={unassignedCats.length === 0}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {unassignedCats.length === 0 ? "All categories assigned" : "Add category"}
                </button>

                <AnimatePresence>
                  {catPickerOpen && unassignedCats.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-52 rounded-xl border border-border bg-card shadow-xl z-20 overflow-hidden py-1"
                    >
                      {unassignedCats.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            assignCatMutation.mutate({ subscriptionId: id, categoryId: cat.id });
                            setCatPickerOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-accent transition-colors text-left"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ background: cat.color ?? "#6366f1" }}
                          />
                          {cat.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Channel stats */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                Channel stats
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: <Users className="h-3.5 w-3.5" />,
                    label: "Subscribers",
                    value: channel.subscriberCount ? fmtNum(Number(channel.subscriberCount)) : "—",
                  },
                  {
                    icon: <Video className="h-3.5 w-3.5" />,
                    label: "Videos",
                    value: channel.videoCount ? Number(channel.videoCount).toLocaleString() : "—",
                  },
                  {
                    icon: <Eye className="h-3.5 w-3.5" />,
                    label: "Total views",
                    value: channel.viewCount ? fmtNum(Number(channel.viewCount)) : "—",
                  },
                  {
                    icon: <Calendar className="h-3.5 w-3.5" />,
                    label: "Created",
                    value: channel.publishedAt
                      ? new Date(channel.publishedAt).toLocaleDateString("en", { month: "short", year: "numeric" })
                      : "—",
                  },
                  {
                    icon: <TrendingUp className="h-3.5 w-3.5" />,
                    label: "Upload freq",
                    value: sub.uploadFrequency ?? "—",
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                      {icon}
                      <span className="text-xs truncate">{label}</span>
                    </div>
                    <span className="text-xs font-medium tabular-nums shrink-0">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel ID */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Channel ID
              </p>
              <p className="text-[11px] text-muted-foreground font-mono break-all">
                {channel.youtubeChannelId}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Remove "${channel.name}"?`}
        description="This will permanently remove this subscription from your library. This action cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate({ id })}
      />
    </>
  );
}
