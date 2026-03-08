"use client";

import {
  BarChart3,
  Download,
  LayoutDashboard,
  PlaySquare,
  Settings,
  Tag,
  Trash2,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href as Route);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} showCloseButton={false}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="py-1">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate("/dashboard")}>
            <LayoutDashboard />
            Overview
          </CommandItem>
          <CommandItem onSelect={() => navigate("/dashboard/channels")}>
            <PlaySquare />
            Subscriptions
          </CommandItem>
          <CommandItem onSelect={() => navigate("/dashboard/categories")}>
            <Tag />
            Categories
          </CommandItem>
          <CommandItem onSelect={() => navigate("/dashboard/analytics")}>
            <BarChart3 />
            Analytics
          </CommandItem>
          <CommandItem onSelect={() => navigate("/dashboard/cleanup")}>
            <Trash2 />
            Cleanup
          </CommandItem>
          <CommandItem onSelect={() => navigate("/dashboard/import")}>
            <Download />
            Import / Export
          </CommandItem>
          <CommandItem onSelect={() => navigate("/dashboard/settings")}>
            <Settings />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
