"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  BarChart3,
  ChevronsLeft,
  Download,
  LayoutDashboard,
  LogOut,
  PlaySquare,
  Search,
  Settings,
  Tag,
  Trash2,
  Youtube,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/channels", label: "Subscriptions", icon: PlaySquare },
  { href: "/dashboard/categories", label: "Categories", icon: Tag },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/cleanup", label: "Cleanup", icon: Trash2 },
  { href: "/dashboard/import", label: "Import", icon: Download },
] as const;

function isActive(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

interface ExpandedSidebarProps {
  pathname: string;
  onLogout: () => void;
  onSearchClick: () => void;
  onToggleCollapse: () => void;
}

export function ExpandedSidebar({
  pathname,
  onLogout,
  onSearchClick,
  onToggleCollapse,
}: ExpandedSidebarProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const name = session?.user.name ?? "User";
  const email = session?.user.email ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-60">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/15 flex items-center justify-center">
            <Youtube className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-semibold text-sm tracking-tight">
            Sub<span className="text-primary">box</span>
          </span>
        </Link>
        <button
          onClick={onToggleCollapse}
          title="Collapse sidebar"
          className="h-7 w-7 rounded-md flex items-center justify-center text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Search */}
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

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-0.5">
          {mainNav.map(({ href, label, icon: Icon, ...rest }) => {
            const exact = "exact" in rest ? rest.exact : false;
            const active = isActive(href, pathname, exact);
            return (
              <Link
                key={href}
                href={href as Route}
                className={cn(
                  "flex items-center gap-3 h-9 px-3 rounded-md text-[13px] transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-2 pt-2">
        <div className="h-px bg-sidebar-border mb-2" />
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 h-8 px-3 rounded-md text-[13px] transition-colors",
            isActive("/dashboard/settings", pathname)
              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
              : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Settings className="h-3.5 w-3.5 shrink-0" />
          Settings
        </Link>
      </div>

      {/* User */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors text-left outline-none">
            <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-sidebar-foreground truncate">{name}</div>
              <div className="text-xs text-sidebar-muted truncate">{email}</div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-sidebar-muted rotate-90 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-medium">{name}</div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{email}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
