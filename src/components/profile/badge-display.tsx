"use client";

import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface EarnedBadge extends BadgeInfo {
  earnedAt: string | Date;
}

interface BadgeDisplayProps {
  earnedBadges: EarnedBadge[];
  allBadges: BadgeInfo[];
}

export function BadgeDisplay({ earnedBadges, allBadges }: BadgeDisplayProps) {
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Badges ({earnedBadges.length}/{allBadges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allBadges.map((badge) => {
            const earned = earnedIds.has(badge.id);
            const earnedData = earnedBadges.find((b) => b.id === badge.id);

            return (
              <div
                key={badge.id}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors",
                  earned
                    ? "bg-card hover:bg-accent/50"
                    : "bg-muted/30 opacity-50"
                )}
              >
                {!earned && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                <span className={cn("text-3xl", !earned && "grayscale")}>
                  {badge.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold leading-tight">
                    {badge.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {badge.description}
                  </p>
                </div>
                {earned && earnedData && (
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(earnedData.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
