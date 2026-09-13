import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 rounded-md bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle>
                <span className="block h-4 w-24 rounded bg-muted" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="block h-6 w-36 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
