import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";

export type ModuleDefinition = {
  title: string;
  eyebrow: string;
  description: string;
  phase: string;
  route: string;
  requiredControls: string[];
  serverBoundary: string;
};

export function ModulePage({ module }: { module: ModuleDefinition }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-medium text-accent">{module.eyebrow}</div>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
            {module.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {module.description}
          </p>
        </div>
        <Badge tone="info">{module.phase}</Badge>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Foundation Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Route</Th>
                  <Th>Server Boundary</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td>{module.route}</Td>
                  <Td>{module.serverBoundary}</Td>
                  <Td>
                    <Badge tone="success">Registered</Badge>
                  </Td>
                </tr>
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required UI Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {module.requiredControls.map((control) => (
                <li key={control} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  {control}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
