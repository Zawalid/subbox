import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary-foreground"><path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 12H3"/><path d="M16 6H3"/><path d="M12 18H3"/></svg>
            </div>
            <span className="font-semibold text-sm tracking-tight">Subbox</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/login" className={buttonVariants({ size: "sm", className: "h-8 rounded-full px-4 text-xs font-medium" })}>
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-6 rounded-full border-primary/30 bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
            YouTube subscription management, reinvented
          </Badge>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Your subscriptions,{" "}
            <span className="text-primary">finally organized</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Import all your YouTube subscriptions. Categorize by topic. Track posting frequency. Discover dead channels. Never miss a creator again.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/login" className={buttonVariants({ size: "lg", className: "h-11 px-8 rounded-full font-medium" })}>
              Start for free →
            </Link>
            <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-8 rounded-full font-medium" })}>
              View demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required · Free forever</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-border/40">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Everything you need</h2>
            <p className="text-muted-foreground max-w-md mx-auto">A complete toolkit for managing your YouTube subscriptions at scale.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "⚡", title: "One-click import", desc: "Connect your Google account and import all subscriptions in seconds." },
              { icon: "🏷️", title: "Smart categories", desc: "Create custom categories and bulk-assign channels with ease." },
              { icon: "📊", title: "Activity tracking", desc: "See when each channel last uploaded. Spot dormant creators instantly." },
              { icon: "🧹", title: "Cleanup tool", desc: "Find and remove channels that haven't posted in months or years." },
              { icon: "🔍", title: "Instant search", desc: "Filter by name, status, or category across all your subscriptions." },
              { icon: "📦", title: "Import & export", desc: "Export your data anytime as CSV. Your subscriptions, your data." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border/60 bg-card/50 p-5 hover:border-primary/30 hover:bg-card transition-all duration-200">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Channels managed" },
              { value: "< 1s", label: "Sync speed" },
              { value: "100%", label: "Your data" },
              { value: "Free", label: "Forever" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-primary mb-1">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extension CTA */}
      <section className="py-20 px-4 border-t border-border/40">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-border/60 bg-card px-4 py-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">Browser extension available</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Save channels while you browse
          </h2>
          <p className="text-muted-foreground mb-8">
            Install the Subbox browser extension and add channels to your library directly from YouTube — without ever leaving the page.
          </p>
          <button className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-8 rounded-full" })}>
            Install Extension
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 px-4">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary-foreground"><path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 12H3"/><path d="M16 6H3"/><path d="M12 18H3"/></svg>
            </div>
            <span className="text-sm font-medium">Subbox</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Subbox. Built for YouTube creators and viewers.</p>
        </div>
      </footer>
    </div>
  );
}
