import { cn } from "@/lib/utils";

export function Table({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-border">
      <table className={cn("w-full min-w-[720px] border-collapse bg-card text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-border bg-surface px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
      {children}
    </th>
  );
}

export function Td({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-border px-4 py-3 align-middle text-foreground">{children}</td>;
}
