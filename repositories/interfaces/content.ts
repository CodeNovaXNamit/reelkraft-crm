import type { WriteRepository } from "@/repositories/interfaces/base";
import type { ContentItem } from "@/types/domain";

export type ContentRepository = WriteRepository<
  ContentItem,
  Partial<ContentItem>,
  Partial<ContentItem>
>;
