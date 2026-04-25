"use client";

import {
  CheckCircle2,
  ArrowUp,
  Award,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials, timeAgo } from "@/lib/utils";

type ActivityType =
  | "PROBLEM_SOLVED"
  | "LEVEL_UP"
  | "BADGE_EARNED"
  | "FRIEND_ADDED"
  | "FRIEND_ACCEPTED"
  | "JOINED"
  | "STREAK_MILESTONE";

interface Activity {
  id: string;
  userId?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  type: string;
  message: string;
  createdAt: string | Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  PROBLEM_SOLVED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  LEVEL_UP: <ArrowUp className="h-4 w-4 text-blue-500" />,
  BADGE_EARNED: <Award className="h-4 w-4 text-amber-500" />,
  FRIEND_ADDED: <UserPlus className="h-4 w-4 text-purple-500" />,
  FRIEND_ACCEPTED: <UserPlus className="h-4 w-4 text-purple-500" />,
  JOINED: <UserPlus className="h-4 w-4 text-green-500" />,
  STREAK_MILESTONE: <MessageSquare className="h-4 w-4 text-orange-500" />,
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity from friends yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          <div className="space-y-0 px-6 pb-6">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 py-3 border-b last:border-0"
              >
                <Avatar className="h-8 w-8 mt-0.5">
                  {activity.avatarUrl && (
                    <AvatarImage src={activity.avatarUrl} alt={activity.username} />
                  )}
                  <AvatarFallback className="text-xs">
                    {getInitials(activity.displayName || activity.username || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {ACTIVITY_ICONS[activity.type as ActivityType] || <CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium truncate">
                      {activity.displayName || activity.username}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.message}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(activity.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
