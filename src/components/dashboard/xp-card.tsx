"use client";

import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface XpCardProps {
  xp: number;
  level: number;
  progress: number;
  nextLevelXp: number;
}

export function XpCard({ xp, level, progress, nextLevelXp }: XpCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Total XP</CardTitle>
        <Star className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">
          {xp.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            Level {level}
          </Badge>
        </div>
        <div className="mt-3 space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% to Level {level + 1} ({nextLevelXp.toLocaleString()} XP)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
