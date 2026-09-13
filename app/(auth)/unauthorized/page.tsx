import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-danger" aria-hidden />
            Access denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            This account is not authorized for Reelkraft OS. Phase 1 connects
            this screen to Google Workspace, employee status, and RBAC checks.
          </p>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
          >
            Return to sign-in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
