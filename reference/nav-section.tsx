"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActive } from "@/lib/dashboard/nav";

export function NavSection({
  title,
  icon: Icon,
  items,
  pathname,
  storageKey,
  onNavigate,
}: {
  title: string;
  icon: LucideIcon;
  items: Array<{ href: string; label: string; icon: LucideIcon }>;
  pathname: string;
  storageKey: string;
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? stored === "true" : true;
  });

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, String(next));
      return next;
    });
  };

  return (
    <div className="mt-3">
      <button
        onClick={toggleExpanded}
        className="flex items-center gap-3 h-9 px-3 rounded-md text-[13px] w-full text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform",
            expanded ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 mt-0.5 pl-4">
              {items.map((item) => {
                const active_ = isActive(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 h-8 px-3 rounded-md text-[13px] transition-colors ${
                      active_
                        ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                        : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
