import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { rolePermissions } from "@/lib/permissions/roles";
import { permissionResources, roles } from "@/types/domain";

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Team</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Permissions</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Server-side role matrix for Phase 1. UI visibility uses the same
          matrix, but protected reads and mutations must call authorization
          helpers on the server.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Role Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <Th>Resource</Th>
                {roles.map((role) => (
                  <Th key={role}>{role}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionResources.map((resource) => (
                <tr key={resource}>
                  <Td>{resource}</Td>
                  {roles.map((role) => (
                    <Td key={role}>
                      <div className="flex flex-wrap gap-1">
                        {rolePermissions[role][resource]?.map((action) => (
                          <Badge key={action} tone="neutral">
                            {action}
                          </Badge>
                        )) ?? <span className="text-muted-foreground">None</span>}
                      </div>
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
