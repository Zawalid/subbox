"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { authClient } from "@/lib/auth-client";
import { CollapsedSidebar } from "./collapsed-sidebar";
import { ExpandedSidebar } from "./expanded-sidebar";
import { CommandPalette } from "./command-palette";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = useCallback(async () => {
    await authClient.signOut();
    router.push("/login");
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
            onLogout={handleLogout}
            onSearchClick={() => setCommandOpen(true)}
            onToggleCollapse={() => setSidebarCollapsed(false)}
          />
        ) : (
          <ExpandedSidebar
            pathname={pathname}
            onLogout={handleLogout}
            onSearchClick={() => setCommandOpen(true)}
            onToggleCollapse={() => setSidebarCollapsed(true)}
          />
        )}
      </motion.aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
