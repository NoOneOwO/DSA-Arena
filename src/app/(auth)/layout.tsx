import Link from "next/link";
import { ArrowLeft, Swords } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </Link>
        <div className="flex items-center gap-2">
          <Swords className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">DSA Arena</span>
        </div>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
