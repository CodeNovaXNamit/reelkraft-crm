import { NextResponse } from "next/server";
import { isAuthBypassEnabled } from "@/lib/auth/testing-bypass";
import { validatePhaseOneEnv, validateServerEnv } from "@/lib/validation/env";

export function GET() {
  const baseEnv = validateServerEnv(process.env);
  const phaseOneEnv = validatePhaseOneEnv(process.env);

  return NextResponse.json({
    ok: baseEnv.success,
    service: "reelkraft-os",
    phase: "1",
    environment: process.env.NODE_ENV ?? "development",
    integrations: {
      googleWorkspaceConfigured: phaseOneEnv.success,
      authBypassEnabled: isAuthBypassEnabled(),
    },
    warnings: phaseOneEnv.success
      ? []
      : phaseOneEnv.error.issues.map((issue) => issue.path.join(".")),
  });
}
