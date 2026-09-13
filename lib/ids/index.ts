export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createRequestId() {
  return createId("req");
}
