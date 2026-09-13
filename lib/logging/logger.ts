type LogFields = Record<string, unknown>;

function scrub(fields: LogFields = {}) {
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => {
      const normalized = key.toLowerCase();
      return (
        !normalized.includes("secret") &&
        !normalized.includes("token") &&
        !normalized.includes("private_key")
      );
    }),
  );
}

export const logger = {
  info(message: string, fields?: LogFields) {
    console.info(JSON.stringify({ level: "info", message, ...scrub(fields) }));
  },
  warn(message: string, fields?: LogFields) {
    console.warn(JSON.stringify({ level: "warn", message, ...scrub(fields) }));
  },
  error(message: string, fields?: LogFields) {
    console.error(JSON.stringify({ level: "error", message, ...scrub(fields) }));
  },
};
