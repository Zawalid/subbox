"use client";

import {
  LayoutDashboard,
  FileText,
  Terminal,
  KeyRound,
  BarChart3,
  Webhook,
  Plug,
  User,
  CreditCard,
  BookOpen,
  Plus,
  Lock,
  FolderGit2,
  FileStack,
  Users,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { usePlanGates } from "@/hooks/use-plan-gates";
import { useProjects, useUserTemplates } from "@/lib/queries";

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (href: string) => void;
}) {
  const actions = useDashboardActions();
  const gates = usePlanGates();

  // Use cached React Query data for gate indicators (no extra requests if pages were visited)
  const { data: projectsData } = useProjects();
  const { data: templatesData } = useUserTemplates();
  const projectCount  = projectsData?.projects?.length  ?? 0;
  const templateCount = templatesData?.templates?.length ?? 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      showCloseButton={false}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => onNavigate("/dashboard")}>
            <LayoutDashboard />
            Overview
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/dashboard/projects")}>
            <FolderGit2 />
            Projects
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/dashboard/playground")}>
            <Terminal />
            Playground
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/dashboard/templates")}>
            <FileStack />
            Templates
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/dashboard/logs")}>
            <FileText />
            Logs
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/dashboard/api-keys")}>
            <KeyRound />
            API Keys
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/dashboard/usage")}>
            <BarChart3 />
            Usage
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Connect">
          <CommandItem onSelect={() => onNavigate("/dashboard/webhooks")}>
            <Webhook />
            Webhooks
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/dashboard/mcp")}>
            <Plug />
            MCP
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => onNavigate("/dashboard/settings/profile")}>
            <User />
            Profile
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/dashboard/settings/billing")}>
            <CreditCard />
            Billing
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/dashboard/settings/usage")}>
            <BarChart3 />
            Usage
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/dashboard/settings/team")}>
            <Users />
            <span className="flex-1">Team</span>
            {!gates.canUseTeam && (
              <span className="text-[10px] font-mono font-medium text-muted-foreground/50">
                Entreprise
              </span>
            )}
          </CommandItem>
          <CommandItem
            onSelect={() => {
              window.open("/docs", "_blank");
              onOpenChange(false);
            }}
          >
            <BookOpen />
            Documentation
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              actions.openCreateApiKey();
              onOpenChange(false);
            }}
          >
            <Plus />
            <span className="flex-1">New API Key</span>
            {gates.atKeyLimit && (
              <Lock className="h-3 w-3 text-muted-foreground/50" />
            )}
          </CommandItem>
          <CommandItem
            onSelect={() => {
              actions.openCreateProject();
              onOpenChange(false);
            }}
          >
            <FolderGit2 />
            <span className="flex-1">New Project</span>
            {gates.atProjectLimit(projectCount) && (
              <Lock className="h-3 w-3 text-muted-foreground/50" />
            )}
          </CommandItem>
          <CommandItem
            onSelect={() => {
              actions.openCreateTemplate();
              onOpenChange(false);
            }}
          >
            <FileStack />
            <span className="flex-1">New Template</span>
            {!gates.canCreateTemplates ? (
              <span className="text-[10px] font-mono font-medium text-muted-foreground/50">
                Pro
              </span>
            ) : gates.atTemplateLimit(templateCount) ? (
              <Lock className="h-3 w-3 text-muted-foreground/50" />
            ) : null}
          </CommandItem>
          <CommandItem
            onSelect={() => {
              actions.openCreateWebhook();
              onOpenChange(false);
            }}
          >
            <Webhook />
            <span className="flex-1">Add Webhook</span>
            {!gates.canUseWebhooks && (
              <span className="text-[10px] font-mono font-medium text-muted-foreground/50">
                Max
              </span>
            )}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
