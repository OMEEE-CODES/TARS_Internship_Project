"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MessageSkeletonProps {
  isOwn?: boolean;
}

export function MessageSkeleton({ isOwn = false }: MessageSkeletonProps) {
  return (
    <div
      className={cn(
        "flex gap-3",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        <Skeleton className={cn("h-10 rounded-2xl", isOwn ? "w-48 rounded-br-none" : "w-64 rounded-bl-none")} />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <MessageSkeleton />
      <MessageSkeleton isOwn />
      <MessageSkeleton />
      <MessageSkeleton isOwn />
      <MessageSkeleton />
    </div>
  );
}
