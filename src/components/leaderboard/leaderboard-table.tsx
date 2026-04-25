"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn, getInitials } from "@/lib/utils";

interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  problemsSolved: number;
  streak: number;
  rank: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1)
    return <span className="text-lg" title="1st place">🥇</span>;
  if (rank === 2)
    return <span className="text-lg" title="2nd place">🥈</span>;
  if (rank === 3)
    return <span className="text-lg" title="3rd place">🥉</span>;
  return (
    <span className="text-sm font-medium text-muted-foreground tabular-nums">
      #{rank}
    </span>
  );
}

export function LeaderboardTable({
  entries,
  currentUserId,
}: LeaderboardTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="hidden sm:table-cell">Level</TableHead>
          <TableHead className="text-right">XP</TableHead>
          <TableHead className="hidden md:table-cell text-right">
            Solved
          </TableHead>
          <TableHead className="hidden lg:table-cell text-right">
            Streak
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => {
          const isCurrentUser = entry.userId === currentUserId;
          const isTop3 = entry.rank <= 3;
          return (
            <TableRow
              key={entry.userId}
              className={cn(
                isCurrentUser && "bg-primary/5 border-primary/20",
                isTop3 && entry.rank === 1 && "bg-yellow-500/5",
                isTop3 && entry.rank === 2 && "bg-gray-300/5",
                isTop3 && entry.rank === 3 && "bg-amber-700/5"
              )}
            >
              <TableCell>
                <RankDisplay rank={entry.rank} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {entry.avatarUrl && (
                      <AvatarImage src={entry.avatarUrl} alt={entry.username} />
                    )}
                    <AvatarFallback className="text-xs">
                      {getInitials(entry.displayName || entry.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-sm font-medium truncate",
                          isCurrentUser && "text-primary"
                        )}
                      >
                        {entry.displayName || entry.username}
                      </span>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          You
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      @{entry.username}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="secondary" className="text-xs">
                  Lv. {entry.level}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {entry.xp.toLocaleString()}
              </TableCell>
              <TableCell className="hidden md:table-cell text-right tabular-nums">
                {entry.problemsSolved}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-right">
                {entry.streak > 0 ? (
                  <span className="tabular-nums">
                    🔥 {entry.streak}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
