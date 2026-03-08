"use client";

import Link from "next/link";
import {
  Search,
  ChevronsLeft,
  User,
  ArrowLeft,
  Rocket,
  BookOpen,
  ChevronRight,
  LogOut,
  Check,
  Zap,
  Keyboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlanBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";
import { Tip } from "@/components/ui/tooltip";
import { UserAvatar } from "./user-avatar";
import { NavSection } from "./nav-section";
import { mainNav, connectNav, settingsItems, isActive } from "@/lib/dashboard/nav";
import { adminPanelUrl } from "@/lib/urls";
import { usePlaygroundStore } from "@/store/playground";
import { SITE_EMAILS } from "@/lib/config/site";
import { NotificationBell } from "./notification-bell";
import { FeedbackPanel } from "./feedback-panel";

export function ExpandedSidebar({
  pathname,
  user,
  isLoading,
  onLogout,
  onSearchClick,
  onToggleCollapse,
  onboardingProgress,
  onNavigate,
  onShortcutsClick,
}: {
  pathname: string;
  user: { name: string; email: string; plan: string; role: string };
  isLoading?: boolean;
  onLogout: () => void;
  onSearchClick: () => void;
  onToggleCollapse: () => void;
  onboardingProgress: number;
  onNavigate?: () => void;
  onShortcutsClick?: () => void;
}) {
  const activeProjectId = usePlaygroundStore((s) => s.activeProjectId);
  const playgroundHref = activeProjectId
    ? `/dashboard/playground?project=${activeProjectId}`
    : "/dashboard/playground";
  void playgroundHref; // kept for potential future use
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-60">
      {/* Top */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo iconClassName="w-6" textSize="text-sm" />
        </Link>
        <div className="flex items-center gap-0.5">
          {user.role === "admin" && (
            <NotificationBell collapsed={true} />
          )}
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar (Ctrl+B)"
            className="h-7 w-7 rounded-md flex items-center justify-center text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Search trigger */}
      <div className="px-3 mb-2">
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2.5 w-full h-9 px-3 rounded-md bg-sidebar-accent border border-sidebar-border text-[13px] text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-sidebar-border px-1.5 py-0.5 text-[10px] font-mono text-sidebar-muted">
            <span className="text-[11px]">&#8984;</span>K
          </kbd>
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-0.5">
          {mainNav.map((item) => {
            const active_ = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 h-9 px-3 rounded-md text-[13px] transition-colors ${
                  active_
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Connect section (collapsible) */}
        <NavSection
          title="Connect"
          icon={Zap}
          items={connectNav}
          pathname={pathname}
          storageKey="fmx:connect-expanded"
          onNavigate={onNavigate}
        />

      </nav>

      {/* Bottom: Getting Started + icon strip */}
      <div className="px-3 pb-2 pt-2">
        <div className="h-px bg-sidebar-border mb-2" />

        {user.role === "admin" && (
          <a
            href={adminPanelUrl()}
            onClick={onNavigate}
            className="flex items-center gap-3 h-8 px-3 rounded-md text-[13px] transition-colors mb-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            Back to Admin Portal
          </a>
        )}

        <Link
          href="/dashboard/getting-started"
          onClick={onNavigate}
          className={`flex items-center gap-3 h-8 px-3 rounded-md text-[13px] transition-colors ${
            isActive("/dashboard/getting-started", pathname)
              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
              : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
          }`}
        >
          <Rocket className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">Getting Started</span>
          {onboardingProgress >= 100 ? (
            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
          ) : (
            <span className="text-[10px] font-mono text-primary tabular-nums">{onboardingProgress}%</span>
          )}
        </Link>

        {/* Utility icon strip — users only */}
        {user.role !== "admin" && (
          <div className="flex items-center gap-0.5 mt-1">
            <Tip label="Documentation" side="top">
              <Link
                href="/docs"
                target="_blank"
                prefetch={false}
                className="flex-1 h-8 rounded-md flex items-center justify-center text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
              </Link>
            </Tip>

            <Tip label="Keyboard shortcuts" side="top">
              <button
                onClick={onShortcutsClick}
                className="flex-1 h-8 rounded-md flex items-center justify-center text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <Keyboard className="h-3.5 w-3.5" />
              </button>
            </Tip>

            <div className="flex-1">
              <Tip label="My feedback" side="top">
                <FeedbackPanel collapsed={false} />
              </Tip>
            </div>

            <div className="flex-1">
              <Tip label="Notifications" side="top">
                <NotificationBell collapsed={false} />
              </Tip>
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div className="border-t border-sidebar-border px-3 py-3">
        {isLoading ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors text-left outline-none">
                <UserAvatar name={user.name} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-sidebar-foreground truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-sidebar-muted rotate-90 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{user.name}</span>
                  <PlanBadge plan={user.plan} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {settingsItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} onClick={onNavigate}>
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={onShortcutsClick}>
                <Keyboard className="h-4 w-4 mr-2" />
                Keyboard shortcuts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
