import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchX className="h-5 w-5 text-muted-foreground" aria-hidden />
            Page not found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            The requested Reelkraft OS page does not exist or is not available
            for this workspace.
          </p>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
          >
            Return to dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
