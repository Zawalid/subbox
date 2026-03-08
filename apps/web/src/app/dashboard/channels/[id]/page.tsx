"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Heart,
  Star,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const STATUS_STYLES: Record<string, { label: string; cn: string }> = {
  active:   { label: "Active",   cn: "bg-green-500/10 text-green-500" },
  inactive: { label: "Inactive", cn: "bg-yellow-500/10 text-yellow-500" },
  dormant:  { label: "Dormant",  cn: "bg-red-500/10 text-red-500" },
};

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function ChannelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: sub, isLoading } = useQuery(trpc.subscriptions.get.queryOptions({ id }));

  const deleteMutation = useMutation(
    trpc.subscriptions.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Subscription removed");
        queryClient.invalidateQueries(trpc.subscriptions.list.queryOptions());
        window.history.back();
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const favoriteMutation = useMutation(
    trpc.subscriptions.update.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(trpc.subscriptions.get.queryOptions({ id })),
      onError: (e) => toast.error(e.message),
    })
  );

  if (isLoading) {
    return (
      <div className="px-6 lg:px-10 py-8 space-y-6 max-w-3xl">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-start gap-5">
          <Skeleton className="h-20 w-20 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="px-6 lg:px-10 py-8 text-center">
        <p className="text-sm text-muted-foreground">Subscription not found</p>
      </div>
    );
  }

  const channel = sub.channel;
  const statusStyle = STATUS_STYLES[sub.status] ?? { label: sub.status, cn: "bg-muted text-muted-foreground" };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="px-6 lg:px-10 py-8 space-y-6 max-w-3xl"
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

      {/* Channel hero */}
      <motion.div variants={fadeUp} className="flex items-start gap-5">
        {channel.thumbnail ? (
          <img
            src={channel.thumbnail}
            alt={channel.name}
            className="h-20 w-20 rounded-full object-cover shrink-0 ring-2 ring-border"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
            {channel.name[0]?.toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{channel.name}</h1>
            <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full capitalize", statusStyle.cn)}>
              {statusStyle.label}
            </span>
            {sub.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
          </div>

          {channel.customUrl && (
            <a
              href={`https://youtube.com/${channel.customUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mt-1"
            >
              {channel.customUrl}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {channel.subscriberCount && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {fmtNum(Number(channel.subscriberCount))} subscribers
              </span>
            )}
            {channel.videoCount && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Video className="h-3.5 w-3.5" />
                {channel.videoCount} videos
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div className="grid divide-x divide-border" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            {
              icon: <Calendar className="h-3.5 w-3.5" />,
              label: "Subscribed",
              value: sub.subscribedAt
                ? new Date(sub.subscribedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
                : "Unknown",
            },
            {
              icon: <Video className="h-3.5 w-3.5" />,
              label: "Last upload",
              value: sub.lastVideoDate
                ? new Date(sub.lastVideoDate).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
                : "Unknown",
            },
            {
              icon: <Heart className="h-3.5 w-3.5" />,
              label: "Favorite",
              value: sub.isFavorite ? "Yes" : "No",
            },
            {
              icon: <Star className="h-3.5 w-3.5" />,
              label: "Categories",
              value: sub.categories.length > 0 ? sub.categories.map(c => c.name).join(", ") : "None",
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="p-4">
              <div className="flex items-center gap-1.5 text-text-tertiary mb-1.5">
                {icon}
                <p className="text-[11px] uppercase tracking-[0.08em] font-medium">{label}</p>
              </div>
              <p className="text-sm font-medium truncate">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => favoriteMutation.mutate({ id, isFavorite: !sub.isFavorite })}
          disabled={favoriteMutation.isPending}
          className={cn(
            "flex items-center gap-2 h-8 px-3.5 rounded-lg border text-xs font-medium transition-colors",
            sub.isFavorite
              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20"
              : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80"
          )}
        >
          <Star className={cn("h-3.5 w-3.5", sub.isFavorite && "fill-yellow-500")} />
          {sub.isFavorite ? "Favorited" : "Add to favorites"}
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
          onClick={() => deleteMutation.mutate({ id })}
          disabled={deleteMutation.isPending}
          className="flex items-center gap-2 h-8 px-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors ml-auto"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </motion.div>

      {/* Description */}
      {channel.description && (
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary font-medium">About</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
            {channel.description}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
