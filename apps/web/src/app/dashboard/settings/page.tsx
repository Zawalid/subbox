"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AlertTriangle, LogOut, Shield, User } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, when: "beforeChildren" } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function SettingsPage() {
  const router  = useRouter();
  const { data: session } = authClient.useSession();

  const name     = session?.user.name    ?? "User";
  const email    = session?.user.email   ?? "";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await authClient.signOut();
    toast.success("Signed out");
    router.push("/login");
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 px-6 lg:px-10 py-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-[28px] font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </motion.div>

      {/* Profile + Account — side by side */}
      <motion.div variants={fadeUp}>
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Profile */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 h-10 border-b border-border flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-text-tertiary" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Profile</span>
            </div>
            <div className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center text-lg font-semibold text-primary shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{name}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
                <p className="text-[11px] text-text-tertiary mt-1">Google account</p>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 h-10 border-b border-border flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-text-tertiary" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Account</span>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium">Sign out</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sign out of your account on this device</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Danger zone — full width */}
      <motion.div variants={fadeUp}>
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 overflow-hidden">
          <div className="px-5 h-10 border-b border-destructive/20 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-destructive">Danger zone</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Delete all data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently remove all subscriptions, categories, and settings. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => toast.error("Not implemented yet")}
              className={cn(
                "flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors shrink-0 ml-6",
                "bg-destructive/10 border border-destructive/25 text-destructive hover:bg-destructive/20"
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Delete data
            </button>
          </div>
        </div>
      </motion.div>

      {/* App info row — like FormaTeX plan limits card */}
      <motion.div variants={fadeUp}>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
            {[
              { label: "App",      value: "Subbox" },
              { label: "Version",  value: "1.0.0" },
              { label: "Stack",    value: "Next.js 16 + tRPC" },
              { label: "Database", value: "PostgreSQL" },
            ].map(item => (
              <div key={item.label} className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  {item.label}
                </p>
                <p className="text-sm font-semibold tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
