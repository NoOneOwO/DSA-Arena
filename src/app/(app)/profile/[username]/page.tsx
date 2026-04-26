"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ProfileHeader } from "@/components/profile/profile-header";
import { TopicBreakdown } from "@/components/profile/topic-breakdown";
import { BadgeDisplay } from "@/components/profile/badge-display";
import { ActivityTimeline } from "@/components/profile/activity-timeline";
import { CompetitiveStats } from "@/components/profile/competitive-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { UserX } from "lucide-react";

interface ProfileData {
  user: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    leetcodeUsername?: string | null;
    codeforcesUsername?: string | null;
    createdAt: string;
  };
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  };
  topicBreakdown: { id: string; name: string; total: number; solved: number }[];
  earnedBadges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }[];
  allBadges: {
    id: string;
    name: string;
    description: string;
    icon: string;
  }[];
  recentActivity: {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
  }[];
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48" />
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-64" />
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = !!(
    currentUser && data?.user &&
    currentUser.id === data.user.id
  );

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/profile/${params.username}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to load profile");
        const json = await res.json();
        setData(json.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (params.username) fetchProfile();
  }, [params.username]);

  function handleCompetitiveUpdate(lc: string | null, cf: string | null) {
    if (!data) return;
    setData({
      ...data,
      user: {
        ...data.user,
        leetcodeUsername: lc,
        codeforcesUsername: cf,
      },
    });
  }

  if (loading) return <ProfileSkeleton />;

  if (notFound) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <UserX className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">User not found</h2>
        <p className="text-muted-foreground">
          The user &quot;{params.username}&quot; doesn&apos;t exist or is not
          your friend.
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <ProfileHeader
        username={data.user.username}
        displayName={data.user.displayName}
        avatarUrl={data.user.avatarUrl}
        level={data.user.level}
        xp={data.user.xp}
        currentStreak={data.user.currentStreak}
        memberSince={data.user.createdAt}
        totalSolved={data.stats.totalSolved}
        easySolved={data.stats.easySolved}
        mediumSolved={data.stats.mediumSolved}
        hardSolved={data.stats.hardSolved}
      />

      <CompetitiveStats
        leetcodeUsername={data.user.leetcodeUsername}
        codeforcesUsername={data.user.codeforcesUsername}
        isOwnProfile={isOwnProfile}
        onUsernamesUpdated={handleCompetitiveUpdate}
      />

      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="badges">
            Badges ({data.earnedBadges?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4">
          <TopicBreakdown topicStats={data.topicBreakdown || []} />
        </TabsContent>

        <TabsContent value="badges" className="mt-4">
          <BadgeDisplay
            earnedBadges={data.earnedBadges || []}
            allBadges={data.allBadges || []}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ActivityTimeline activities={data.recentActivity || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
