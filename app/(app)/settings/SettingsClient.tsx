"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Globe,
  Lock,
} from "lucide-react";
import { ProfileImageUploader } from "@/components/profile/ProfileImageUploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { checkUsernameAvailable } from "@/actions/social";

interface SettingsClientProps {
  userId: string;
  initialName: string;
  initialEmail: string;
  initialUsername?: string;
  initialBio?: string;
  initialImage?: string;
  initialIsPublic?: boolean;
}

type UsernameState = "idle" | "checking" | "available" | "taken" | "invalid";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function SettingsClient({
  userId,
  initialName,
  initialEmail,
  initialUsername = "",
  initialBio = "",
  initialImage = "",
  initialIsPublic = true,
}: SettingsClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [image, setImage] = useState(initialImage);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [usernameState, setUsernameState] = useState<UsernameState>("idle");
  const [isSaving, setIsSaving] = useState(false);

  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    const cleaned = debouncedUsername.toLowerCase().trim();
    if (cleaned === (initialUsername ?? "").toLowerCase()) {
      setUsernameState("idle");
      return;
    }
    if (!cleaned) {
      setUsernameState("idle");
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(cleaned)) {
      setUsernameState("invalid");
      return;
    }
    setUsernameState("checking");
    checkUsernameAvailable(cleaned, userId).then((result) => {
      if (result.data?.available === false) {
        setUsernameState(result.error ? "invalid" : "taken");
      } else {
        setUsernameState("available");
      }
    });
  }, [debouncedUsername, userId, initialUsername]);

  const hasChanges =
    name !== initialName ||
    username.toLowerCase().trim() !== (initialUsername ?? "") ||
    bio !== (initialBio ?? "") ||
    (image || "") !== (initialImage ?? "") ||
    isPublic !== initialIsPublic;

  async function handleSave() {
    if (usernameState === "taken" || usernameState === "invalid") {
      toast({
        variant: "destructive",
        title: "Fix username",
        description: usernameState === "taken"
          ? "That username is already taken."
          : "Username: 3–30 chars, letters/numbers/underscores only.",
      });
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: name.trim(),
          username: username.trim().toLowerCase() || undefined,
          bio: bio.trim(),
          image: image.trim() || undefined,
          isPublic,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ variant: "destructive", title: "Error", description: data.error ?? "Failed to save." });
        return;
      }
      toast({ title: "Profile saved" });
      router.refresh();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Network error." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Public Profile ─── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>How you appear to other HabitFlow users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar uploader */}
          <ProfileImageUploader
            currentImage={image}
            name={name}
            onUploadSuccess={(url) => {
              setImage(url);
              router.refresh();
            }}
          />

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
              <Input
                id="username"
                className="pl-7 pr-8"
                placeholder="yourhandle"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                maxLength={30}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {usernameState === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {usernameState === "available" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {(usernameState === "taken" || usernameState === "invalid") && <XCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {usernameState === "taken" && <span className="text-destructive">Username is taken.</span>}
              {usernameState === "invalid" && <span className="text-destructive">3–30 chars: letters, numbers, underscores only.</span>}
              {usernameState === "available" && <span className="text-emerald-600">Username is available!</span>}
              {(usernameState === "idle" || usernameState === "checking") && username && (
                <Link href={`/u/${username}`} className="text-violet-600 hover:underline" target="_blank">
                  /u/{username} <ExternalLink className="ml-0.5 inline h-3 w-3" />
                </Link>
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              rows={3}
              maxLength={200}
              placeholder="Tell others about your habits and goals…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              {isPublic ? <Globe className="h-5 w-5 text-violet-500" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">{isPublic ? "Public profile" : "Private profile"}</p>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? "Anyone can view your profile and public habits" : "Only followers can view your profile"}
                </p>
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges || usernameState === "taken" || usernameState === "invalid"}
            className="btn-gradient"
          >
            {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Account ─── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={initialEmail} disabled />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Danger Zone ─── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
            </div>
            <Button variant="destructive" size="sm" disabled>Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
