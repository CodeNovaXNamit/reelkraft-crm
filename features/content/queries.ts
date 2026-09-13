import { getCurrentActor } from "@/lib/auth/current-user";
import { createContentServices } from "@/features/content/service";
import type { PageQuery } from "@/types/pagination";

export async function getContentData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { content } = createContentServices();
  return content.list(query, actor);
}
