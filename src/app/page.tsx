"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  Flame,
  Target,
  ArrowRight,
  Swords,
  BarChart3,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Track Progress",
    description:
      "Monitor your DSA journey across 80+ curated problems organized by topic and difficulty.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Users,
    title: "Compete with Friends",
    description:
      "Add friends, compare stats on the leaderboard, and push each other to improve.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Earn XP & Badges",
    description:
      "Gain experience points for every problem solved. Unlock badges for milestones.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Flame,
    title: "Stay Consistent",
    description:
      "Build daily streaks, track weekly activity, and never lose momentum.",
    color: "from-rose-500 to-pink-500",
  },
];

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DSA Arena</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-500/5" />
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:py-32 lg:py-40">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Trophy className="h-4 w-4 text-primary" />
            <span>Level up your DSA game</span>
          </div>
          <h1 className="mb-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
            <span className="gradient-text">DSA Arena</span>
          </h1>
          <p className="mb-4 max-w-2xl text-xl text-muted-foreground sm:text-2xl lg:text-3xl">
            Track. Compete. Conquer DSA with friends.
          </p>
          <p className="mb-10 max-w-lg text-muted-foreground">
            The gamified platform that turns grinding LeetCode into an
            adventure. Earn XP, unlock badges, climb the leaderboard, and stay
            consistent with streaks.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="/login">I have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
              Everything you need to master DSA
            </h2>
            <p className="text-muted-foreground">
              A complete toolkit to keep you motivated and on track.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${f.color} p-2.5`}
                >
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">80+</div>
              <div className="text-muted-foreground">Curated Problems</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">17</div>
              <div className="text-muted-foreground">DSA Topics</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">6</div>
              <div className="text-muted-foreground">Achievement Badges</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <BarChart3 className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="mb-3 text-3xl font-bold">Ready to start?</h2>
          <p className="mb-8 text-muted-foreground">
            Join DSA Arena today and turn your DSA practice into a rewarding
            journey.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/signup">
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4" />
            <span>DSA Arena</span>
          </div>
          <div>Built for DSA grinders.</div>
        </div>
      </footer>
    </div>
  );
}
