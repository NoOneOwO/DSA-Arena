"use client";

import { Users } from "lucide-react";
import { FriendCard } from "./friend-card";

interface FriendData {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  streak: number;
  problemsSolved: number;
}

interface FriendListProps {
  friends: FriendData[];
}

export function FriendList({ friends }: FriendListProps) {
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold">No friends yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Add friends to compare progress, compete on the leaderboard, and stay motivated together.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {friends.map((friend) => (
        <FriendCard key={friend.userId} friend={friend} />
      ))}
    </div>
  );
}
