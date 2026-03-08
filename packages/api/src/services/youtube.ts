import { env } from "@subbox/env/server";

export interface YouTubeSubscription {
  channelId: string;
  channelName: string;
  description: string;
  thumbnail: string;
  customUrl?: string;
  country?: string;
  subscriberCount?: string;
  videoCount?: string;
  viewCount?: string;
  publishedAt?: string;
  subscribedAt?: string;
}

export interface YouTubeChannelDetails {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  customUrl?: string;
  country?: string;
  subscriberCount?: string;
  videoCount?: string;
  viewCount?: string;
  publishedAt?: string;
  lastVideoDate?: string;
  uploadsPlaylistId?: string;
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export async function fetchUserSubscriptions(
  accessToken: string,
): Promise<YouTubeSubscription[]> {
  const subscriptions: YouTubeSubscription[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${YOUTUBE_API_BASE}/subscriptions`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("mine", "true");
    url.searchParams.set("maxResults", "50");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      items: Array<{
        snippet: {
          resourceId: { channelId: string };
          title: string;
          description: string;
          thumbnails: {
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
          };
          publishedAt: string;
        };
      }>;
      nextPageToken?: string;
    };

    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      subscriptions.push({
        channelId: snippet.resourceId.channelId,
        channelName: snippet.title,
        description: snippet.description,
        thumbnail:
          snippet.thumbnails.high?.url ??
          snippet.thumbnails.medium?.url ??
          snippet.thumbnails.default?.url ??
          "",
        subscribedAt: snippet.publishedAt,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return subscriptions;
}

export async function fetchLastVideoDate(
  uploadsPlaylistId: string,
): Promise<string | undefined> {
  const url = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("playlistId", uploadsPlaylistId);
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("key", env.YOUTUBE_API_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) return undefined;

  const data = (await response.json()) as {
    items?: Array<{ snippet: { publishedAt: string } }>;
  };

  return data.items?.[0]?.snippet.publishedAt;
}

export async function enrichChannelsWithLastVideoDate(
  channels: YouTubeChannelDetails[],
): Promise<YouTubeChannelDetails[]> {
  const enriched = await Promise.allSettled(
    channels.map(async (channel) => {
      if (!channel.uploadsPlaylistId) return channel;
      const lastVideoDate = await fetchLastVideoDate(channel.uploadsPlaylistId);
      return { ...channel, lastVideoDate };
    }),
  );

  return enriched.map((result, i) =>
    result.status === "fulfilled" ? result.value : channels[i]!,
  );
}

export async function fetchChannelDetails(
  channelIds: string[],
): Promise<YouTubeChannelDetails[]> {
  if (channelIds.length === 0) return [];

  const results: YouTubeChannelDetails[] = [];
  const chunks = chunkArray(channelIds, 50);

  for (const chunk of chunks) {
    const url = new URL(`${YOUTUBE_API_BASE}/channels`);
    url.searchParams.set("part", "snippet,statistics,contentDetails");
    url.searchParams.set("id", chunk.join(","));
    url.searchParams.set("key", env.YOUTUBE_API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      items: Array<{
        id: string;
        snippet: {
          title: string;
          description: string;
          customUrl?: string;
          country?: string;
          publishedAt: string;
          thumbnails: {
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
          };
        };
        statistics?: {
          subscriberCount?: string;
          videoCount?: string;
          viewCount?: string;
        };
        contentDetails?: {
          relatedPlaylists?: {
            uploads?: string;
          };
        };
      }>;
    };

    for (const item of data.items ?? []) {
      results.push({
        id: item.id,
        name: item.snippet.title,
        description: item.snippet.description,
        thumbnail:
          item.snippet.thumbnails.high?.url ??
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          "",
        customUrl: item.snippet.customUrl,
        country: item.snippet.country,
        publishedAt: item.snippet.publishedAt,
        subscriberCount: item.statistics?.subscriberCount,
        videoCount: item.statistics?.videoCount,
        viewCount: item.statistics?.viewCount,
        uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads,
      });
    }
  }

  return results;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function computeSubscriptionStatus(
  lastVideoDate: Date | null | undefined,
): "active" | "inactive" | "dormant" {
  if (!lastVideoDate) return "inactive";
  const now = new Date();
  const diffMonths =
    (now.getTime() - lastVideoDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (diffMonths > 12) return "dormant";
  if (diffMonths > 6) return "inactive";
  return "active";
}
