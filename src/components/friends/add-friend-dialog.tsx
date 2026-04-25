"use client";

import { useState } from "react";
import { Copy, Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AddFriendDialogProps {
  inviteCode: string;
  onAdd: (type: "username" | "code", value: string) => Promise<{ success: boolean; message: string }>;
}

export function AddFriendDialog({ inviteCode, onAdd }: AddFriendDialogProps) {
  const [open, setOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(type: "username" | "code") {
    const value = type === "username" ? usernameInput.trim() : codeInput.trim();
    if (!value) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await onAdd(type, value);
      setResult(res);
      if (res.success) {
        setUsernameInput("");
        setCodeInput("");
      }
    } catch {
      setResult({ success: false, message: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setResult(null); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Add a friend by username or invite code.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="username" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="username">By Username</TabsTrigger>
            <TabsTrigger value="code">By Invite Code</TabsTrigger>
          </TabsList>

          <TabsContent value="username" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="friend-username">Username</Label>
              <Input
                id="friend-username"
                placeholder="Enter username..."
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit("username")}
              />
            </div>
            <Button
              onClick={() => handleSubmit("username")}
              disabled={!usernameInput.trim() || loading}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </TabsContent>

          <TabsContent value="code" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                placeholder="Enter invite code..."
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit("code")}
              />
            </div>
            <Button
              onClick={() => handleSubmit("code")}
              disabled={!codeInput.trim() || loading}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </TabsContent>
        </Tabs>

        {result && (
          <p
            className={
              result.success
                ? "text-sm text-green-600 dark:text-green-400"
                : "text-sm text-destructive"
            }
          >
            {result.message}
          </p>
        )}

        <div className="mt-2 rounded-lg border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground mb-2">
            Your invite code
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-background px-3 py-1.5 text-sm font-mono border">
              {inviteCode}
            </code>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
