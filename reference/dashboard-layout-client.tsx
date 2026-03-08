"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { loginUrl, navigate } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/error-boundary";
import { UpgradeModalProvider } from "@/components/upgrade-modal";
import { DashboardActionsProvider } from "@/hooks/use-dashboard-actions";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useGettingStarted } from "@/hooks/use-getting-started";
import { CollapsedSidebar } from "@/components/dashboard/collapsed-sidebar";
import { ExpandedSidebar } from "@/components/dashboard/expanded-sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { ShortcutsModal } from "@/components/shortcuts-modal";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { ScreenGuard } from "@/components/screen-guard";
import { DashboardLoader } from "@/components/dashboard/dashboard-loader";
import { UsageBanner } from "@/components/ui/usage-banner";
import { SiteBanner } from "@/components/ui/site-banner";
import { useMaintenanceStatus } from "@/lib/queries";
import { FeedbackWidget } from "@/components/dashboard/feedback-widget";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSSE } from "@/hooks/use-sse";
import { SubscriptionExpiryModal } from "@/components/subscription-expiry-modal";
import {
  GLOBAL_SHORTCUTS,
} from "@/lib/shortcuts";

// ---------------------------------------------------------------------------
// Inner component — must live inside DashboardActionsProvider to call the hook
// ---------------------------------------------------------------------------

interface ShortcutsHandlerProps {
  commandOpen: boolean;
  shortcutsModalOpen: boolean;
  onToggleCommand: () => void;
  onToggleSidebar: () => void;
  onOpenShortcuts: () => void;
}

function DashboardShortcutsHandler({
  commandOpen,
  shortcutsModalOpen,
  onToggleCommand,
  onToggleSidebar,
  onOpenShortcuts,
}: ShortcutsHandlerProps) {
  const { openCreateApiKey } = useDashboardActions();
  const router = useRouter();
  const pathname = usePathname();

  const shortcuts = useMemo(
    () => [
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "cmd-k")!,
        action: onToggleCommand,
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "ctrl-b")!,
        action: onToggleSidebar,
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "help")!,
        action: onOpenShortcuts,
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "create-key")!,
        action: openCreateApiKey,
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "go-overview")!,
        action: () => router.push("/dashboard"),
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "go-projects")!,
        action: () => router.push("/dashboard/projects"),
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "go-logs")!,
        action: () => router.push("/dashboard/logs"),
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "go-keys")!,
        action: () => router.push("/dashboard/api-keys"),
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "go-usage")!,
        action: () => router.push("/dashboard/usage"),
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "go-playground")!,
        action: () => router.push("/dashboard/playground"),
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "go-templates")!,
        action: () => router.push("/dashboard/templates"),
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "go-webhooks")!,
        action: () => router.push("/dashboard/webhooks"),
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "go-mcp")!,
        action: () => router.push("/dashboard/mcp"),
      },
      {
        ...GLOBAL_SHORTCUTS.find((s) => s.id === "go-settings")!,
        action: () => router.push("/dashboard/settings/profile"),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onToggleCommand, onToggleSidebar, onOpenShortcuts, openCreateApiKey, pathname],
  );

  useKeyboardShortcuts(shortcuts, !commandOpen && !shortcutsModalOpen);

  return null;
}

// ---------------------------------------------------------------------------
// Main layout
// ---------------------------------------------------------------------------

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const { data: maintenanceStatus } = useMaintenanceStatus();
  useSSE();
  const router = useRouter();
  const pathname = usePathname();
  const { progress: onboardingProgress } = useGettingStarted();
  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [subExpiryOpen, setSubExpiryOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    pathname === "/dashboard/playground"
  );
  const isPlayground = pathname === "/dashboard/playground";
  const isEditor = pathname.endsWith("/edit") || pathname === "/dashboard/templates/new";
  const isFullscreen = isPlayground || isEditor;
  // Stable key for settings routes so the transition doesn't fire on tab switches
  const pageKey = pathname.startsWith("/dashboard/settings")
    ? "/dashboard/settings"
    : pathname;

  // Auth guard
  useEffect(() => {
    if (!isLoading && !user) {
      navigate(loginUrl(), router);
    }
  }, [user, isLoading, router]);

  // Maintenance guard — redirect non-admins to /maintenance when active
  useEffect(() => {
    if (maintenanceStatus?.maintenanceMode && user?.role !== "admin") {
      router.replace("/maintenance");
    }
  }, [maintenanceStatus, user, router]);

  // Email verification guard
  useEffect(() => {
    if (!isLoading && user && !user.emailVerified) {
      router.push("/verify-email");
    }
  }, [user, isLoading, router]);

  // Subscription expiry modal — show once per session when cancellation is pending
  useEffect(() => {
    if (
      !isLoading &&
      user &&
      user.subscriptionStatus === "canceled" &&
      user.subscriptionEndsAt &&
      !sessionStorage.getItem("formatex_sub_expiry_dismissed")
    ) {
      setSubExpiryOpen(true);
    }
  }, [user, isLoading]);

  // Auto-collapse sidebar on playground
  useEffect(() => {
    setSidebarCollapsed(isPlayground);
  }, [isPlayground]);

  const handleLogout = useCallback(() => {
    logout();
    navigate(loginUrl(), router);
  }, [logout, router]);

  const navigateTo = useCallback(
    (href: string) => {
      router.push(href);
      setCommandOpen(false);
    },
    [router],
  );

  if (isLoading) return <DashboardLoader />;
  if (!user) return null;

  return (
    <UpgradeModalProvider>
      <DashboardActionsProvider>
        <DashboardShortcutsHandler
          commandOpen={commandOpen}
          shortcutsModalOpen={shortcutsModalOpen}
          onToggleCommand={() => setCommandOpen((prev) => !prev)}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          onOpenShortcuts={() => setShortcutsModalOpen(true)}
        />
      <ScreenGuard />
      <div className={cn("bg-background flex", isFullscreen ? "h-screen overflow-hidden" : "min-h-screen")}>
        {/* Command palette (Cmd+K) */}
        <CommandPalette
          open={commandOpen}
          onOpenChange={setCommandOpen}
          onNavigate={navigateTo}
        />

        {/* Keyboard shortcuts help modal (?) */}
        <ShortcutsModal
          open={shortcutsModalOpen}
          onOpenChange={setShortcutsModalOpen}
        />

        {/* Subscription expiry modal — once per session when status === "canceled" */}
        <SubscriptionExpiryModal
          open={subExpiryOpen}
          onOpenChange={(open) => {
            setSubExpiryOpen(open);
            if (!open) sessionStorage.setItem("formatex_sub_expiry_dismissed", "1");
          }}
        />

        {/* Desktop sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarCollapsed ? 56 : 240 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex shrink-0 flex-col sticky top-0 h-screen border-r border-sidebar-border overflow-hidden"
        >
          {sidebarCollapsed ? (
            <CollapsedSidebar
              pathname={pathname}
              user={user ?? { name: "", email: "", plan: "free", role: "user" }}
              isLoading={isLoading}
              onLogout={handleLogout}
              onSearchClick={() => setCommandOpen(true)}
              onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
              onShortcutsClick={() => setShortcutsModalOpen(true)}
            />
          ) : (
            <ExpandedSidebar
              pathname={pathname}
              user={user ?? { name: "", email: "", plan: "free", role: "user" }}
              isLoading={isLoading}
              onLogout={handleLogout}
              onSearchClick={() => setCommandOpen(true)}
              onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
              onboardingProgress={onboardingProgress}
              onShortcutsClick={() => setShortcutsModalOpen(true)}
            />
          )}
        </motion.aside>

        {/* Main */}
        <div className={cn("flex-1 flex flex-col min-w-0", isFullscreen && "overflow-hidden")}>
          {/* Mobile top bar */}
          <MobileHeader
            pathname={pathname}
            user={user ?? { name: "", email: "", plan: "free", role: "user" }}
            onLogout={handleLogout}
            onSearchClick={() => setCommandOpen(true)}
            onboardingProgress={onboardingProgress}
          />

          {/* Site-wide admin banner — shown when enabled from maintenance settings */}
          {!isFullscreen && <SiteBanner />}

          {/* Compilation usage banner — visible when approaching or at limit */}
          {!isFullscreen && <UsageBanner />}

          {/* Content
            relative is required so the exiting page (position:absolute via
            mode="popLayout") is contained within this element. */}
          <main
            className={cn(
              "relative flex-1 flex flex-col min-h-0",
              isFullscreen
                ? "p-0 overflow-hidden"
                : "p-6 lg:px-10 lg:py-8"
            )}
          >
            <ErrorBoundary>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={pageKey}
                  // No `initial` prop — entering page appears at full opacity immediately.
                  // React 19 defers useEffect (animation start) inside startTransition,
                  // causing initial={{ opacity:0 }} to get permanently stuck. Removing
                  // `initial` means nothing is ever stuck: the page is visible right away.
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.15,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  className={
                    isFullscreen
                      ? "flex-1 flex flex-col min-h-0 overflow-hidden"
                      : "min-w-0 w-full"
                  }
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </main>
        </div>

      </div>
        {/* Feedback widget — hidden for admins */}
        {!isFullscreen && user?.role !== "admin" && <FeedbackWidget />}
      </DashboardActionsProvider>
    </UpgradeModalProvider>
  );
}
