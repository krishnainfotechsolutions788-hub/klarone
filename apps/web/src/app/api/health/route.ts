import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api";

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  checks: {
    frontend: {
      status: "up";
      latencyMs: number;
    };
    backendApi: {
      status: "up" | "down";
      latencyMs: number;
      endpoint?: string;
      error?: string;
    };
  };
}

export async function GET() {
  const startTime = performance.now();
  const apiBaseUrl = getApiBaseUrl();

  let backendStatus: "up" | "down" = "down";
  let backendLatency = 0;
  let backendError: string | undefined;

  // Probe backend API heartbeat with a strict 4-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  const backendStart = performance.now();

  try {
    const res = await fetch(`${apiBaseUrl}/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    backendLatency = Math.round(performance.now() - backendStart);
    if (res.ok) {
      backendStatus = "up";
    } else {
      backendError = `HTTP ${res.status}`;
    }
  } catch (err) {
    backendLatency = Math.round(performance.now() - backendStart);
    backendError = err instanceof Error ? err.message : "Unreachable";
  } finally {
    clearTimeout(timeoutId);
  }

  const frontendLatency = Math.round(performance.now() - startTime);
  const overallStatus = backendStatus === "up" ? "healthy" : "degraded";

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development",
    checks: {
      frontend: {
        status: "up",
        latencyMs: frontendLatency,
      },
      backendApi: {
        status: backendStatus,
        latencyMs: backendLatency,
        endpoint: apiBaseUrl,
        ...(backendError ? { error: backendError } : {}),
      },
    },
  };

  return NextResponse.json(result, {
    status: overallStatus === "healthy" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
