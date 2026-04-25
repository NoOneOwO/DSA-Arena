"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProblemsTodayCardProps {
  count: number;
}

export function ProblemsTodayCard({ count }: ProblemsTodayCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Today</CardTitle>
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{count}</div>
        <p className="text-xs text-muted-foreground">
          {count === 1 ? "problem" : "problems"} logged today
        </p>
      </CardContent>
    </Card>
  );
}
