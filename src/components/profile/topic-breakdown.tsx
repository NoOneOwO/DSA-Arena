"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopicStat {
  id: string;
  name: string;
  total: number;
  solved: number;
}

interface TopicBreakdownProps {
  topicStats: TopicStat[];
}

export function TopicBreakdown({ topicStats }: TopicBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Topic Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topicStats.map((topic) => {
            const pct =
              topic.total > 0 ? (topic.solved / topic.total) * 100 : 0;
            return (
              <div
                key={topic.id}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{topic.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {topic.solved}/{topic.total}
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
