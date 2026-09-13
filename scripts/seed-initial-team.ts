import { createRepositoryContext } from "@/repositories/factory";
import type { Actor, Role } from "@/types/domain";

const initialTeam: Array<{ name: string; role: Role }> = [
  { name: "Shivam", role: "FOUNDER_ADMIN" },
  { name: "Samriti", role: "SALES_FINANCE" },
  { name: "Mehak", role: "OPERATIONS_HEAD" },
  { name: "Neha", role: "HR_ACCOUNT_MANAGER" },
  { name: "Shahid", role: "VIDEO_DESIGN_HEAD" },
  { name: "Kamal", role: "VIDEO_EDITOR" },
];

const systemActor: Actor = {
  id: "system",
  email: "system@reelkraftmedia.online",
  role: "FOUNDER_ADMIN",
  status: "ACTIVE",
};

function emailFor(name: string) {
  const key = `REELKRAFT_${name.toUpperCase()}_EMAIL`;
  const override = process.env[key];
  if (override) {
    return override.toLowerCase();
  }

  throw new Error(`Set ${key} before seeding.`);
}

async function main() {
  const repositories = createRepositoryContext();
  await repositories.sheetsClient.ensureWorkbookSchema();

  for (const member of initialTeam) {
    await repositories.employees.create(
      {
        name: member.name,
        email: emailFor(member.name),
        role: member.role,
        status: "ACTIVE",
      },
      systemActor,
    );
  }

  console.log("Initial Reelkraft team seed completed.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
