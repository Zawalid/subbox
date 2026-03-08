"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Pencil, Plus, Tag, Trash2, X } from "lucide-react";

import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const PRESET_COLORS = [
  "#e11d48",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function CategoryManager() {
  const queryClient = useQueryClient();
  const [newName, setNewName]       = useState("");
  const [newColor, setNewColor]     = useState(PRESET_COLORS[0]!);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [editName, setEditName]     = useState("");
  const [editColor, setEditColor]   = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: categories = [], isLoading } = useQuery(trpc.categories.list.queryOptions());

  const createMutation = useMutation(
    trpc.categories.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.categories.list.queryOptions());
        setNewName("");
        setShowForm(false);
        toast.success("Category created");
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const updateMutation = useMutation(
    trpc.categories.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.categories.list.queryOptions());
        setEditId(null);
        toast.success("Category updated");
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const deleteMutation = useMutation(
    trpc.categories.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.categories.list.queryOptions());
        setDeleteTarget(null);
        toast.success("Category deleted");
      },
      onError: (e) => {
        setDeleteTarget(null);
        toast.error(e.message);
      },
    })
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName.trim(), color: newColor });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editName.trim()) return;
    updateMutation.mutate({ id: editId, name: editName.trim(), color: editColor });
  };

  return (
    <>
      <div className="space-y-6 px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Categories</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading ? "Loading..." : `${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(f => !f)}
            className={cn(
              "flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors mt-1",
              showForm
                ? "border border-border bg-card text-muted-foreground hover:text-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? "Cancel" : "New category"}
          </button>
        </div>

        {/* ── Create form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleCreate}
                className="rounded-xl border border-primary/25 bg-card p-5 space-y-4"
              >
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  New category
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Category name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="h-9 text-sm flex-1"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !newName.trim()}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full shrink-0" style={{ background: newColor }} />
                  <div className="flex gap-2">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        className={cn(
                          "h-6 w-6 rounded-full transition-all flex items-center justify-center",
                          newColor === c ? "ring-2 ring-offset-2 ring-offset-card scale-110" : "opacity-50 hover:opacity-100 hover:scale-110"
                        )}
                        style={{ background: c }}
                      >
                        {newColor === c && <Check className="h-3 w-3 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                  {newName.trim() && (
                    <span
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full text-white ml-auto"
                      style={{ background: newColor }}
                    >
                      {newName.trim()}
                    </span>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0,1,2,3,4,5].map(i => <Skeleton key={i} className="h-[110px] rounded-xl" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-16 text-center">
            <div className="h-12 w-12 rounded-xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
              <Tag className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1.5">No categories yet</p>
            <p className="text-xs text-muted-foreground mb-5 max-w-xs mx-auto">
              Create categories to organise your subscriptions into groups.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create first category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence initial={false}>
              {categories.map(cat => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  layout
                >
                  {editId === cat.id ? (
                    /* ── Edit card ── */
                    <form
                      onSubmit={handleUpdate}
                      className="rounded-xl border border-primary/30 bg-card p-4 space-y-3 h-[110px] flex flex-col justify-between"
                    >
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 flex-1">
                          {PRESET_COLORS.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditColor(c)}
                              className={cn(
                                "h-4 w-4 rounded-full transition-all flex items-center justify-center",
                                editColor === c ? "ring-2 ring-offset-1 ring-offset-card scale-110" : "opacity-50 hover:opacity-100"
                              )}
                              style={{ background: c }}
                            >
                              {editColor === c && <Check className="h-2 w-2 text-white drop-shadow" />}
                            </button>
                          ))}
                        </div>
                        <button
                          type="submit"
                          className="h-7 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shrink-0"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* ── View card ── */
                    <div className="group relative rounded-xl border border-border bg-card overflow-hidden h-[110px] flex hover:border-border/60 transition-colors">
                      {/* Colored left panel */}
                      <div
                        className="w-12 shrink-0"
                        style={{ background: cat.color ?? "#6366f1" }}
                      />
                      <div className="flex-1 flex flex-col justify-between p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[15px] font-semibold leading-tight">{cat.name}</p>
                          {/* Hover actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditColor(cat.color ?? PRESET_COLORS[0]!); }}
                              className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                              className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {cat.channelCategories.length}{" "}
                            {cat.channelCategories.length === 1 ? "channel" : "channels"}
                          </span>
                          <span className="h-3 w-px bg-border" />
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(cat.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the category. Channels assigned to it will not be deleted."
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
      />
    </>
  );
}
