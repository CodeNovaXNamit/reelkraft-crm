import Link from "next/link";
import { LogIn, ShieldCheck } from "lucide-react";
import { signInWithGoogle } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              RK
            </span>
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                Reelkraft Media
              </div>
              <CardTitle>Reelkraft OS</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Use your verified @reelkraftmedia.online Google Workspace account.
            Access is granted only when your employee record is active or a
            pending invitation exists.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" aria-hidden />
            Server-side employee access checks enabled
          </div>
          <form action={signInWithGoogle}>
            <Button className="w-full" type="submit">
              <LogIn className="h-4 w-4" aria-hidden />
              Continue with Google
            </Button>
          </form>
          <Link
            href="/dashboard"
            className="block text-center text-sm font-medium text-accent"
          >
            Open dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
