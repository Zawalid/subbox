"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  BarChart3,
  ChevronsRight,
  Download,
  LayoutDashboard,
  LogOut,
  PlaySquare,
  Search,
  Settings,
  Tag,
  Trash2,
  Youtube,
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

interface CollapsedSidebarProps {
  pathname: string;
  onLogout: () => void;
  onSearchClick: () => void;
  onToggleCollapse: () => void;
}

export function CollapsedSidebar({
  pathname,
  onLogout,
  onSearchClick,
  onToggleCollapse,
}: CollapsedSidebarProps) {
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
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-14">
      {/* Logo icon */}
      <div className="h-14 flex items-center justify-center shrink-0">
        <Link href="/dashboard" title="Subbox">
          <div className="h-7 w-7 rounded-md bg-primary/15 flex items-center justify-center">
            <Youtube className="h-3.5 w-3.5 text-primary" />
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="flex justify-center mb-2 shrink-0">
        <button
          onClick={onSearchClick}
          title="Search (Cmd+K)"
          className="h-9 w-9 rounded-md flex items-center justify-center bg-sidebar-accent border border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 flex flex-col items-center gap-0.5 overflow-y-auto px-2 min-h-0"
        style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)" }}
      >
        {mainNav.map(({ href, label, icon: Icon, ...rest }) => {
          const exact = "exact" in rest ? rest.exact : false;
          const active = isActive(href, pathname, exact);
          return (
            <Link
              key={href}
              href={href as Route}
              title={label}
              className={cn(
                "h-9 w-9 rounded-md flex items-center justify-center transition-colors shrink-0",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </Link>
          );
        })}

        <div className="my-1.5 w-6 h-px bg-sidebar-border shrink-0" />

        <Link
          href="/dashboard/settings"
          title="Settings"
          className={cn(
            "h-9 w-9 rounded-md flex items-center justify-center transition-colors shrink-0",
            isActive("/dashboard/settings", pathname)
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
        </Link>
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border pt-2 pb-3 flex flex-col items-center gap-1 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-sidebar-accent transition-colors outline-none"
            title={name}
          >
            <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-semibold text-primary">
              {initials}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 ml-1">
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

        <button
          onClick={onToggleCollapse}
          title="Expand sidebar"
          className="h-7 w-7 rounded-md flex items-center justify-center text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
