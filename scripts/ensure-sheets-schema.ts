import { createRepositoryContext } from "@/repositories/factory";

async function main() {
  const { sheetsClient } = createRepositoryContext();
  await sheetsClient.ensureWorkbookSchema();
  console.log("Reelkraft OS workbook schema is ready.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
