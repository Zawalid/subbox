"use client";

import Link from "next/link";
import { ChevronsRight, ArrowLeft, Search, LogOut, Keyboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlanBadge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { UserAvatar } from "./user-avatar";
import { mainNav, connectNav, settingsItems, isActive } from "@/lib/dashboard/nav";
import { adminPanelUrl } from "@/lib/urls";
import { usePlaygroundStore } from "@/store/playground";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationBell } from "./notification-bell";
import { FeedbackPanel } from "./feedback-panel";

export function CollapsedSidebar({
  pathname,
  user,
  isLoading,
  onLogout,
  onSearchClick,
  onToggleCollapse,
  onNavigate,
  onShortcutsClick,
}: {
  pathname: string;
  user: { name: string; email: string; plan: string; role: string };
  isLoading?: boolean;
  onLogout: () => void;
  onSearchClick: () => void;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
  onShortcutsClick?: () => void;
}) {
  void usePlaygroundStore((s) => s.activeProjectId);

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-14">

      {/* Logo icon */}
      <div className="h-14 flex items-center justify-center shrink-0">
        <Link href="/dashboard" onClick={onNavigate} title="FormaTeX">
          <Logo variant="icon" iconClassName="w-7" />
        </Link>
      </div>

      {/* Search */}
      <div className="flex justify-center mb-2 shrink-0">
        <button
          onClick={onSearchClick}
          title="Search (⌘K)"
          className="h-9 w-9 rounded-md flex items-center justify-center bg-sidebar-accent border border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Nav — scrollable with fade mask */}
      <nav
        className="flex-1 flex flex-col items-center gap-0.5 overflow-y-auto px-2 min-h-0"
        style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)" }}
      >
        {mainNav.map((item) => {
          const active_ = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={item.label}
              className={cn(
                "h-9 w-9 rounded-md flex items-center justify-center transition-colors shrink-0",
                active_
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
            </Link>
          );
        })}

        <div className="my-1.5 w-6 h-px bg-sidebar-border shrink-0" />

        {connectNav.map((item) => {
          const active_ = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={item.label}
              className={cn(
                "h-9 w-9 rounded-md flex items-center justify-center transition-colors shrink-0",
                active_
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
            </Link>
          );
        })}

        {user.role === "admin" && (
          <>
            <div className="my-1.5 w-6 h-px bg-sidebar-border shrink-0" />
            <a
              href={adminPanelUrl()}
              onClick={onNavigate}
              title="Back to Admin Portal"
              className="h-9 w-9 rounded-md flex items-center justify-center transition-colors shrink-0 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </a>
          </>
        )}
      </nav>

      {/* Bottom tray — minimal: bell + feedback (non-admin) + avatar + expand */}
      <div className="border-t border-sidebar-border pt-2 pb-3 flex flex-col items-center gap-1 shrink-0">
        {user.role !== "admin" && <FeedbackPanel collapsed={true} />}
        <NotificationBell collapsed={true} />

        {isLoading ? (
          <Skeleton className="h-7 w-7 rounded-full" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-sidebar-accent transition-colors outline-none"
                title={user.name}
              >
                <UserAvatar name={user.name} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56 ml-1">
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

        <button
          onClick={onToggleCollapse}
          title="Expand sidebar (Ctrl+B)"
          className="h-7 w-7 rounded-md flex items-center justify-center text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
