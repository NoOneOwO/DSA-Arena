"use client";

import { Check, X, Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

interface RequestUser {
  friendshipId: string;
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

interface PendingRequestsProps {
  incoming: RequestUser[];
  outgoing: RequestUser[];
  onAccept: (friendshipId: string) => void;
  onReject: (friendshipId: string) => void;
  onCancel: (friendshipId: string) => void;
}

function UserRow({
  user,
  actions,
}: {
  user: RequestUser;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.username} />
          )}
          <AvatarFallback className="text-xs">
            {getInitials(user.displayName || user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {user.displayName || user.username}
          </p>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">{actions}</div>
    </div>
  );
}

export function PendingRequests({
  incoming,
  outgoing,
  onAccept,
  onReject,
  onCancel,
}: PendingRequestsProps) {
  const totalCount = incoming.length + outgoing.length;

  if (totalCount === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pending Requests ({totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {incoming.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Incoming ({incoming.length})
            </h4>
            <div>
              {incoming.map((user) => (
                <UserRow
                  key={user.friendshipId}
                  user={user}
                  actions={
                    <>
                      <Button
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => onAccept(user.friendshipId)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-xs"
                        onClick={() => onReject(user.friendshipId)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {outgoing.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Outgoing ({outgoing.length})
            </h4>
            <div>
              {outgoing.map((user) => (
                <UserRow
                  key={user.friendshipId}
                  user={user}
                  actions={
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
                      onClick={() => onCancel(user.friendshipId)}
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  }
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
