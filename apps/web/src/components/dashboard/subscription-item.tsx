"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

export type SubscriptionItem = {
  id: string;
  status: "active" | "inactive" | "dormant";
  isFavorite: boolean;
  lastVideoDate?: Date | string | null;
  subscribedAt?: Date | string | null;
  channel: {
    id: string;
    name: string;
    thumbnail?: string | null;
    youtubeChannelId: string;
    customUrl?: string | null;
    subscriberCount?: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    color?: string | null;
  }>;
};

const STATUS_BADGE: Record<
  string,
  "success" | "warning" | "destructive" | "secondary"
> = {
  active: "success",
  inactive: "warning",
  dormant: "destructive",
};

function formatDate(date?: Date | string | null): string {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SubscriptionCard({
  sub,
  selected,
  onSelect,
  categories,
}: {
  sub: SubscriptionItem;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  categories: Array<{ id: string; name: string; color?: string | null }>;
}) {
  const queryClient = useQueryClient();

  const assignCategoryMutation = useMutation(
    trpc.subscriptions.assignCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.subscriptions.list.queryOptions());
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const channelUrl = sub.channel.customUrl
    ? `https://youtube.com/${sub.channel.customUrl}`
    : `https://youtube.com/channel/${sub.channel.youtubeChannelId}`;

  return (
    <div
      className={`rounded-lg border p-4 flex flex-col gap-3 transition-all ${
        selected ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
      }`}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(sub.id, !!checked)}
          className="mt-1"
        />
        <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
          {sub.channel.thumbnail ? (
            <img
              src={sub.channel.thumbnail}
              alt={sub.channel.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
              {sub.channel.name[0]}
            </div>
          )}
        </a>
        <div className="flex-1 min-w-0">
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sm hover:underline line-clamp-1"
          >
            {sub.channel.name}
          </a>
          {sub.channel.subscriberCount && (
            <p className="text-xs text-muted-foreground">
              {Number(sub.channel.subscriberCount).toLocaleString()} subscribers
            </p>
          )}
        </div>
        <Badge variant={STATUS_BADGE[sub.status] ?? "secondary"} className="flex-shrink-0">
          {sub.status}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div>Last video: {formatDate(sub.lastVideoDate)}</div>
        <div>Subscribed: {formatDate(sub.subscribedAt)}</div>
      </div>

      {sub.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {sub.categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: cat.color ? `${cat.color}20` : undefined,
                color: cat.color ?? undefined,
                border: `1px solid ${cat.color ?? "#6366f1"}`,
              }}
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <Select
          className="text-xs h-7"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              assignCategoryMutation.mutate({
                subscriptionId: sub.id,
                categoryId: e.target.value,
              });
              e.target.value = "";
            }
          }}
        >
          <option value="">+ Add to category</option>
          {categories
            .filter((c) => !sub.categories.some((sc) => sc.id === c.id))
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </Select>
      )}
    </div>
  );
}

export function SubscriptionRow({
  sub,
  selected,
  onSelect,
  categories,
}: {
  sub: SubscriptionItem;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  categories: Array<{ id: string; name: string; color?: string | null }>;
}) {
  const queryClient = useQueryClient();

  const assignCategoryMutation = useMutation(
    trpc.subscriptions.assignCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.subscriptions.list.queryOptions());
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const channelUrl = sub.channel.customUrl
    ? `https://youtube.com/${sub.channel.customUrl}`
    : `https://youtube.com/channel/${sub.channel.youtubeChannelId}`;

  return (
    <tr className={`border-b transition-colors ${selected ? "bg-primary/5" : "hover:bg-muted/50"}`}>
      <td className="px-3 py-2">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(sub.id, !!checked)}
        />
      </td>
      <td className="px-3 py-2">
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline"
        >
          {sub.channel.thumbnail ? (
            <img
              src={sub.channel.thumbnail}
              alt={sub.channel.name}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
              {sub.channel.name[0]}
            </div>
          )}
          <span className="text-sm font-medium">{sub.channel.name}</span>
        </a>
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {formatDate(sub.subscribedAt)}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {formatDate(sub.lastVideoDate)}
      </td>
      <td className="px-3 py-2">
        <Badge variant={STATUS_BADGE[sub.status] ?? "secondary"}>{sub.status}</Badge>
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1 items-center">
          {sub.categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: cat.color ? `${cat.color}20` : undefined,
                color: cat.color ?? undefined,
                border: `1px solid ${cat.color ?? "#6366f1"}`,
              }}
            >
              {cat.name}
            </span>
          ))}
          {categories.length > 0 && (
            <Select
              className="text-xs h-6 w-auto min-w-0 py-0"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  assignCategoryMutation.mutate({
                    subscriptionId: sub.id,
                    categoryId: e.target.value,
                  });
                  e.target.value = "";
                }
              }}
            >
              <option value="">+</option>
              {categories
                .filter((c) => !sub.categories.some((sc) => sc.id === c.id))
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </Select>
          )}
        </div>
      </td>
    </tr>
  );
}
