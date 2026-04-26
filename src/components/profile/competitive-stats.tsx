"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink, Link2, Loader2, Trophy } from "lucide-react";

interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
}

interface CodeforcesStats {
  username: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  contribution: number;
}

interface CompetitiveStatsProps {
  leetcodeUsername?: string | null;
  codeforcesUsername?: string | null;
  isOwnProfile: boolean;
  onUsernamesUpdated?: (lc: string | null, cf: string | null) => void;
}

function getCfRankColor(rank: string) {
  const r = rank.toLowerCase();
  if (r.includes("legendary") || r.includes("tourist"))
    return "text-red-600 dark:text-red-400";
  if (r.includes("international grandmaster"))
    return "text-red-500 dark:text-red-400";
  if (r.includes("grandmaster")) return "text-red-500 dark:text-red-400";
  if (r.includes("international master"))
    return "text-orange-500 dark:text-orange-400";
  if (r.includes("master")) return "text-orange-500 dark:text-orange-400";
  if (r.includes("candidate master"))
    return "text-violet-500 dark:text-violet-400";
  if (r.includes("expert")) return "text-blue-500 dark:text-blue-400";
  if (r.includes("specialist")) return "text-cyan-500 dark:text-cyan-400";
  if (r.includes("pupil")) return "text-green-500 dark:text-green-400";
  return "text-muted-foreground";
}

export function CompetitiveStats({
  leetcodeUsername,
  codeforcesUsername,
  isOwnProfile,
  onUsernamesUpdated,
}: CompetitiveStatsProps) {
  const [lcStats, setLcStats] = useState<LeetCodeStats | null>(null);
  const [cfStats, setCfStats] = useState<CodeforcesStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lcInput, setLcInput] = useState(leetcodeUsername || "");
  const [cfInput, setCfInput] = useState(codeforcesUsername || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const hasAnyUsername = !!leetcodeUsername || !!codeforcesUsername;

  const fetchStats = useCallback(async () => {
    if (!leetcodeUsername && !codeforcesUsername) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (leetcodeUsername) params.set("leetcode", leetcodeUsername);
      if (codeforcesUsername) params.set("codeforces", codeforcesUsername);

      const res = await fetch(`/api/competitive-stats?${params.toString()}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setLcStats(json.data?.leetcode || null);
      setCfStats(json.data?.codeforces || null);
    } catch {
      // Silently fail - stats are supplementary
    } finally {
      setLoading(false);
    }
  }, [leetcodeUsername, codeforcesUsername]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile/competitive", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leetcodeUsername: lcInput.trim() || null,
          codeforcesUsername: cfInput.trim() || null,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save");
      }
      setDialogOpen(false);
      onUsernamesUpdated?.(lcInput.trim() || null, cfInput.trim() || null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (!hasAnyUsername && !isOwnProfile) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Competitive Programming
        </CardTitle>
        {isOwnProfile && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Link2 className="h-3 w-3 mr-1" />
                {hasAnyUsername ? "Edit" : "Link Accounts"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Competitive Accounts</DialogTitle>
                <DialogDescription>
                  Enter your usernames to display stats on your profile. Leave
                  blank to unlink.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-amber-500/10 text-xs font-bold text-amber-600">
                      LC
                    </span>
                    LeetCode Username
                  </label>
                  <Input
                    placeholder="e.g. johndoe"
                    value={lcInput}
                    onChange={(e) => setLcInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-blue-500/10 text-xs font-bold text-blue-600">
                      CF
                    </span>
                    Codeforces Username
                  </label>
                  <Input
                    placeholder="e.g. tourist"
                    value={cfInput}
                    onChange={(e) => setCfInput(e.target.value)}
                  />
                </div>
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {!hasAnyUsername && isOwnProfile && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Link your LeetCode or Codeforces account to display your competitive
            programming stats.
          </p>
        )}

        {hasAnyUsername && loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {hasAnyUsername && !loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {leetcodeUsername && (
              <LeetCodeCard stats={lcStats} username={leetcodeUsername} />
            )}
            {codeforcesUsername && (
              <CodeforcesCard stats={cfStats} username={codeforcesUsername} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeetCodeCard({
  stats,
  username,
}: {
  stats: LeetCodeStats | null;
  username: string;
}) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-amber-500/10 text-xs font-bold text-amber-600">
            LC
          </span>
          <span className="text-sm font-semibold">LeetCode</span>
        </div>
        <a
          href={`https://leetcode.com/u/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          @{username}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-bold tabular-nums">
                {stats.totalSolved}
              </div>
              <div className="text-[10px] text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold tabular-nums text-green-600 dark:text-green-400">
                {stats.easySolved}
              </div>
              <div className="text-[10px] text-muted-foreground">Easy</div>
            </div>
            <div>
              <div className="text-lg font-bold tabular-nums text-yellow-600 dark:text-yellow-400">
                {stats.mediumSolved}
              </div>
              <div className="text-[10px] text-muted-foreground">Medium</div>
            </div>
            <div>
              <div className="text-lg font-bold tabular-nums text-red-600 dark:text-red-400">
                {stats.hardSolved}
              </div>
              <div className="text-[10px] text-muted-foreground">Hard</div>
            </div>
          </div>
          {stats.ranking > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Global Ranking: #{stats.ranking.toLocaleString()}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          Could not fetch stats. Username may be invalid.
        </p>
      )}
    </div>
  );
}

function CodeforcesCard({
  stats,
  username,
}: {
  stats: CodeforcesStats | null;
  username: string;
}) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-500/10 text-xs font-bold text-blue-600">
            CF
          </span>
          <span className="text-sm font-semibold">Codeforces</span>
        </div>
        <a
          href={`https://codeforces.com/profile/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          @{username}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {stats ? (
        <>
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">
                {stats.rating}
              </div>
              <div className="text-[10px] text-muted-foreground">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold tabular-nums text-muted-foreground">
                {stats.maxRating}
              </div>
              <div className="text-[10px] text-muted-foreground">Max</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="outline"
              className={getCfRankColor(stats.rank)}
            >
              {stats.rank}
            </Badge>
          </div>
          {stats.maxRank !== stats.rank && (
            <p className="text-xs text-muted-foreground text-center">
              Max rank:{" "}
              <span className={getCfRankColor(stats.maxRank)}>
                {stats.maxRank}
              </span>
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          Could not fetch stats. Username may be invalid.
        </p>
      )}
    </div>
  );
}
