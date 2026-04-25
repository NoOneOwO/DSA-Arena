"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { FriendList } from "@/components/friends/friend-list";
import { AddFriendDialog } from "@/components/friends/add-friend-dialog";
import { PendingRequests } from "@/components/friends/pending-requests";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Users } from "lucide-react";

interface Friend {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  streak: number;
  problemsSolved: number;
}

interface RequestUser {
  friendshipId: string;
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

function FriendsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    </div>
  );
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<RequestUser[]>([]);
  const [outgoing, setOutgoing] = useState<RequestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setError("");
    try {
      const [friendsRes, pendingRes] = await Promise.all([
        fetch("/api/friends"),
        fetch("/api/friends/pending"),
      ]);

      if (!friendsRes.ok) throw new Error("Failed to load friends");
      if (!pendingRes.ok) throw new Error("Failed to load requests");

      const friendsJson = await friendsRes.json();
      const pendingJson = await pendingRes.json();

      const friendsData = friendsJson.data?.friends || friendsJson.data || [];
      const mappedFriends = (Array.isArray(friendsData) ? friendsData : []).map(
        (f: Record<string, unknown>) => ({
          userId: (f.id as string) || (f.userId as string),
          username: f.username as string,
          displayName: f.displayName as string | undefined,
          avatarUrl: f.avatarUrl as string | undefined,
          xp: (f.xp as number) || 0,
          level: (f.level as number) || 1,
          streak: (f.currentStreak as number) || (f.streak as number) || 0,
          problemsSolved: (f.problemsSolved as number) || 0,
        })
      );
      setFriends(mappedFriends);

      const pendingData = pendingJson.data || {};
      const receivedArr = pendingData.received || pendingData.incoming || [];
      const sentArr = pendingData.sent || pendingData.outgoing || [];

      const incomingArr = receivedArr.map(
        (r: Record<string, unknown>) => {
          const u = (r.user || r.requester) as Record<string, unknown> || {};
          return {
            friendshipId: r.friendshipId as string,
            userId: (u.id as string) || (r.id as string),
            username: (u.username as string) || "",
            displayName: u.displayName as string | undefined,
            avatarUrl: u.avatarUrl as string | undefined,
          };
        }
      );
      const outgoingArr = sentArr.map(
        (r: Record<string, unknown>) => {
          const u = (r.user || r.addressee) as Record<string, unknown> || {};
          return {
            friendshipId: r.friendshipId as string,
            userId: (u.id as string) || (r.id as string),
            username: (u.username as string) || "",
            displayName: u.displayName as string | undefined,
            avatarUrl: u.avatarUrl as string | undefined,
          };
        }
      );
      setIncoming(incomingArr);
      setOutgoing(outgoingArr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAddFriend(
    type: "username" | "code",
    value: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const body =
        type === "username"
          ? { username: value }
          : { inviteCode: value };

      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: json.error || "Failed to send request",
        };
      }

      await fetchData();
      return { success: true, message: "Friend request sent!" };
    } catch {
      return { success: false, message: "Something went wrong" };
    }
  }

  async function handleAccept(userId: string) {
    try {
      const res = await fetch(`/api/friends/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      if (!res.ok) throw new Error("Failed to accept");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept request");
    }
  }

  async function handleReject(userId: string) {
    try {
      const res = await fetch(`/api/friends/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    }
  }

  async function handleCancel(userId: string) {
    try {
      const res = await fetch(`/api/friends/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to cancel");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel request");
    }
  }

  if (loading) return <FriendsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Friends
            </h1>
            <p className="text-muted-foreground">
              Compete and stay motivated together.
            </p>
          </div>
        </div>
        <AddFriendDialog
          inviteCode={user?.inviteCode || ""}
          onAdd={handleAddFriend}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {(incoming.length > 0 || outgoing.length > 0) && (
        <PendingRequests
          incoming={incoming}
          outgoing={outgoing}
          onAccept={handleAccept}
          onReject={handleReject}
          onCancel={handleCancel}
        />
      )}

      {friends.length === 0 && incoming.length === 0 && outgoing.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-1 text-lg font-semibold">No friends yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Add friends to compete on the leaderboard together.
          </p>
          <AddFriendDialog
            inviteCode={user?.inviteCode || ""}
            onAdd={handleAddFriend}
          />
        </div>
      ) : (
        <FriendList friends={friends} />
      )}
    </div>
  );
}
