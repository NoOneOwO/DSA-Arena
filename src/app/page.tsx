"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Swords, Crown, Shield, Loader2 } from "lucide-react";

const MEMBERS = [
  { name: "Prakhar", username: "prakhar", isAdmin: false },
  { name: "Taiyab", username: "taiyab", isAdmin: true },
  { name: "Satyam", username: "satyam", isAdmin: true },
  { name: "Arham", username: "arham", isAdmin: false },
  { name: "Vivek", username: "vivek", isAdmin: false },
];

export default function LoginPage() {
  const { isAuthenticated, loading, login } = useAuth();
  const router = useRouter();
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  async function handleLogin(username: string, isAdmin: boolean) {
    if (isAdmin && !selectedAdmin) {
      setSelectedAdmin(username);
      setError("");
      return;
    }

    setError("");
    setLoggingIn(true);

    try {
      await login(username, isAdmin ? adminKey : undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoggingIn(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-primary/3 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <div className="mb-10 flex flex-col items-center gap-3">
          <Swords className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="gradient-text">DSA Arena</span>
          </h1>
          <p className="text-muted-foreground text-center">
            Pick your name and jump in
          </p>
        </div>

        {selectedAdmin ? (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <p className="font-semibold text-lg">
                {MEMBERS.find((m) => m.username === selectedAdmin)?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Enter the secret key to continue
              </p>
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}
            <Input
              type="password"
              placeholder="Secret key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && adminKey) {
                  handleLogin(selectedAdmin, true);
                }
              }}
              className="h-12 text-center text-lg tracking-widest bg-card border-border"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => {
                  setSelectedAdmin(null);
                  setAdminKey("");
                  setError("");
                }}
              >
                Back
              </Button>
              <Button
                className="flex-1 h-11"
                onClick={() => handleLogin(selectedAdmin, true)}
                disabled={loggingIn || !adminKey}
              >
                {loggingIn && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enter
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}
            {MEMBERS.map((member) => (
              <button
                key={member.username}
                onClick={() => handleLogin(member.username, member.isAdmin)}
                disabled={loggingIn}
                className="group w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 disabled:opacity-50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary border border-primary/20">
                  {member.name[0]}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {member.name}
                    </span>
                    {member.isAdmin && (
                      <Crown className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {member.isAdmin ? "Admin" : "Member"}
                  </span>
                </div>
                <div className="text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary">
                  &rarr;
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
