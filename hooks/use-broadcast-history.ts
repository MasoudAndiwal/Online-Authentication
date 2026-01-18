"use client";

import { useQuery } from "@tanstack/react-query";

export interface BroadcastHistoryItem {
  id: string;
  className: string;
  content: string;
  category: string;
  totalRecipients: number;
  deliveredCount: number;
  readCount: number;
  createdAt: string;
}

/**
 * Hook for fetching broadcast history
 */
export function useBroadcastHistory() {
  return useQuery<BroadcastHistoryItem[], Error>({
    queryKey: ["broadcast-history"],
    queryFn: async () => {
      const response = await fetch("/api/messages/broadcast/history", {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to view broadcast history.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch broadcast history");
      }

      const data = await response.json();
      return data.broadcasts as BroadcastHistoryItem[];
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
    retry: 2,
  });
}
