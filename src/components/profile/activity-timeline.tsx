"use client";

import {
  CheckCircle2,
  ArrowUp,
  Award,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ActivityType =
  | "PROBLEM_SOLVED"
  | "LEVEL_UP"
  | "BADGE_EARNED"
  | "FRIEND_ADDED"
  | "FRIEND_ACCEPTED"
  | "JOINED"
  | "STREAK_MILESTONE";

interface TimelineActivity {
  id: string;
  type: string;
  message: string;
  createdAt: string | Date;
  metadata?: Record<string, unknown>;
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
}

const ICON_MAP: Record<ActivityType, React.ReactNode> = {
  PROBLEM_SOLVED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  LEVEL_UP: <ArrowUp className="h-4 w-4 text-blue-500" />,
  BADGE_EARNED: <Award className="h-4 w-4 text-amber-500" />,
  FRIEND_ADDED: <UserPlus className="h-4 w-4 text-amber-500" />,
  FRIEND_ACCEPTED: <UserPlus className="h-4 w-4 text-amber-500" />,
  JOINED: <UserPlus className="h-4 w-4 text-green-500" />,
  STREAK_MILESTONE: <MessageSquare className="h-4 w-4 text-orange-500" />,
};

function groupByDate(activities: TimelineActivity[]) {
  const groups: Record<string, TimelineActivity[]> = {};
  for (const activity of activities) {
    const dateKey = new Date(activity.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(activity);
  }
  return groups;
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const groups = groupByDate(activities);

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groups).map(([date, items]) => (
            <div key={date}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {date}
              </h4>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border" />
                {items.map((item) => (
                  <div key={item.id} className="relative flex items-start gap-3">
                    <div className="absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border">
                      {ICON_MAP[item.type as ActivityType] || <CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{item.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
