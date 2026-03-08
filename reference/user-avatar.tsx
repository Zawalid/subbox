export function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="h-7 w-7 rounded-full bg-sidebar-primary/15 flex items-center justify-center text-[11px] font-semibold text-sidebar-primary shrink-0">
      {initials}
    </div>
  );
}
