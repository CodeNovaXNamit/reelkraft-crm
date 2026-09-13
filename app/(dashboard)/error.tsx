"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard unavailable</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {error.message || "The protected dashboard could not be loaded."}
        </p>
        <Button onClick={reset} type="button">
          <RotateCcw className="h-4 w-4" aria-hidden />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
