"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LevelCardProps {
  level: number;
  xp: number;
}

function getLevelTier(level: number): {
  label: string;
  color: string;
} {
  if (level >= 20) return { label: "Grandmaster", color: "text-red-500" };
  if (level >= 15) return { label: "Master", color: "text-purple-500" };
  if (level >= 10) return { label: "Expert", color: "text-blue-500" };
  if (level >= 5) return { label: "Intermediate", color: "text-green-500" };
  return { label: "Beginner", color: "text-muted-foreground" };
}

export function LevelCard({ level, xp }: LevelCardProps) {
  const tier = getLevelTier(level);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Level</CardTitle>
        <Trophy className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{level}</div>
        <Badge variant="outline" className={cn("mt-1 text-xs", tier.color)}>
          {tier.label}
        </Badge>
        <p className="text-xs text-muted-foreground mt-2">
          {xp.toLocaleString()} total XP
        </p>
      </CardContent>
    </Card>
  );
}
