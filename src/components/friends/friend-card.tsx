"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

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

interface FriendCardProps {
  friend: FriendData;
}

export function FriendCard({ friend }: FriendCardProps) {
  return (
    <Link href={`/profile/${friend.username}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar className="h-14 w-14">
              {friend.avatarUrl && (
                <AvatarImage src={friend.avatarUrl} alt={friend.username} />
              )}
              <AvatarFallback className="text-lg">
                {getInitials(friend.displayName || friend.username)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 w-full">
              <p className="font-semibold truncate">
                {friend.displayName || friend.username}
              </p>
              <p className="text-xs text-muted-foreground">
                @{friend.username}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Lv. {friend.level}
              </Badge>
              {friend.streak > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-orange-500">
                  <Flame className="h-3 w-3" />
                  {friend.streak}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full text-center">
              <div>
                <div className="text-sm font-semibold tabular-nums">
                  {friend.xp.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground">XP</div>
              </div>
              <div>
                <div className="text-sm font-semibold tabular-nums">
                  {friend.problemsSolved}
                </div>
                <div className="text-[10px] text-muted-foreground">Solved</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
