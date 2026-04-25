"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarUser {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  xp: number;
  level: number;
}

interface SidebarProps {
  user: SidebarUser;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

function getLevelProgress(xp: number, level: number) {
  const currentLevelXp = level * level * 100;
  const nextLevelXp = (level + 1) * (level + 1) * 100;
  return Math.min(
    100,
    Math.max(0, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
  );
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const progress = getLevelProgress(user.xp, user.level);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r bg-background h-[calc(100vh-3.5rem)] sticky top-14">
      <nav className="flex-1 p-4 space-y-1">
        {NAV_LINKS.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive && "bg-primary/10 text-primary font-semibold"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <Separator className="mb-4" />
        <div className="rounded-lg border bg-card p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {user.displayName || user.username}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Lv. {user.level}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{user.xp.toLocaleString()} XP</span>
              <span>Level {user.level + 1}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>
    </aside>
  );
}
