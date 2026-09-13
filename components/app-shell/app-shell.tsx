import Link from "next/link";
import { Bell, Menu, Search, ShieldCheck, X } from "lucide-react";
import { visibleNavigationForRole } from "@/components/app-shell/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOutOfCrm } from "@/features/auth/actions";
import type { Actor } from "@/types/domain";

export function AppShell({
  actor,
  children,
}: {
  actor: Actor;
  children: React.ReactNode;
}) {
  const navigation = visibleNavigationForRole(actor.role);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card/90 shadow-[12px_0_30px_rgb(32_37_34/0.04)] backdrop-blur lg:block">
        <div className="flex h-20 items-center border-b border-border px-5">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-xs font-bold tracking-wide text-accent-foreground shadow-sm shadow-orange-900/15">
              RK
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Reelkraft Media
              </span>
              <span className="truncate text-base font-semibold tracking-tight">Reelkraft OS</span>
            </span>
          </Link>
        </div>
        <nav className="h-[calc(100vh-5rem)] overflow-y-auto px-3 py-4">
          <div className="mb-5 rounded-xl border border-border bg-surface p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden />
              Secured workspace
            </div>
            <div className="mt-2 truncate text-sm font-medium">{actor.email}</div>
            <div className="mt-1 text-xs text-muted-foreground">{actor.role}</div>
          </div>

          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent-soft/70 hover:text-primary"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-transparent bg-surface text-muted-foreground transition-colors group-hover:border-accent/20 group-hover:bg-card group-hover:text-accent">
                    <item.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
                {item.children ? (
                  <div className="ml-7 mt-1 space-y-1 border-l border-border pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <MobileNavigation navigation={navigation} />
              <div className="hidden min-w-[320px] items-center gap-2 rounded-xl border border-border bg-card/70 px-3.5 py-2.5 text-sm text-muted-foreground shadow-sm md:flex">
                <Search className="h-4 w-4 text-accent" aria-hidden />
                Search leads, clients, tasks, content
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="success">Live workspace</Badge>
              <Button variant="secondary" size="icon" aria-label="View notifications">
                <Bell className="h-4 w-4" aria-hidden />
              </Button>
              <div className="hidden text-right text-sm sm:block">
                <div className="max-w-48 truncate font-medium">{actor.email}</div>
                <div className="text-muted-foreground">{actor.role}</div>
              </div>
              <form action={signOutOfCrm}>
                <Button variant="secondary" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[90rem] px-4 py-7 md:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

function MobileNavigation({
  navigation,
}: {
  navigation: ReturnType<typeof visibleNavigationForRole>;
}) {
  return (
    <details className="group relative lg:hidden">
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm marker:hidden">
        <Menu className="h-5 w-5 group-open:hidden" aria-hidden />
        <X className="hidden h-5 w-5 group-open:block" aria-hidden />
        <span className="sr-only">Open navigation</span>
      </summary>
      <div className="absolute left-0 top-12 z-50 max-h-[70vh] w-[min(88vw,340px)] overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-[var(--shadow)]">
        {navigation.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <item.icon className="h-4 w-4 text-accent" aria-hidden />
              {item.label}
            </Link>
            {item.children ? (
              <div className="ml-7 space-y-1 border-l border-border pl-2">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </details>
  );
}
