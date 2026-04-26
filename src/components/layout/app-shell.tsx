"use client";

import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface AppShellUser {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  xp: number;
  level: number;
}

interface AppShellProps {
  children: React.ReactNode;
  user: AppShellUser;
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
