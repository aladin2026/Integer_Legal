import { getPlatformAccessToken, LegalApiError } from "./platform-auth";

export type MatterListItem = {
  id: string;
  reference: string;
  title: string;
  status: number;
  clientId: string;
  clientName: string;
  responsibleUserId: string;
  createdAt: string;
};

export type Matter360 = {
  matter: MatterListItem;
  deadlines: Array<{ id: string; title: string; dueAt: string; status: number }>;
  parties: Array<{ id: string; displayName: string; roleCode: string; isAdverse: boolean }>;
  conflictChecks: Array<{ id: string; status: number; decision: number | null; createdAt: string }>;
  procedures: Array<{ id: string; procedureType: string; jurisdiction: string; status: number }>;
  hearings: Array<{ id: string; procedureId: string; scheduledAt: string; purpose: string; status: number; outcome: string | null }>;
  documents: Array<{ id: string; title: string; classification: string; versionCount: number; createdAt: string }>;
  financial: { totalMinutes: number; totalExpenses: number; budgetAmount: number | null; approvedPrebillsTotal: number; currency: string };
};

const baseUrl = (process.env.NEXT_PUBLIC_INTEGER_LEGAL_API_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!baseUrl) throw new LegalApiError("configuration_missing", 0, "The Legal API URL is not configured.");
  const token = await getPlatformAccessToken();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    signal,
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => ({})) as { title?: string; detail?: string; traceId?: string };
    throw new LegalApiError(
      response.status === 401 ? "authentication_required" : response.status === 403 ? "access_denied" : "api_error",
      response.status,
      problem.detail ?? problem.title ?? `Legal API returned ${response.status}.`,
      response.headers.get("x-correlation-id") ?? problem.traceId,
    );
  }
  return response.json() as Promise<T>;
}

export const legalApi = {
  listMatters: (signal?: AbortSignal) => request<MatterListItem[]>("/api/v1/matter-queries?limit=100", signal),
  getMatter360: (matterId: string, signal?: AbortSignal) => request<Matter360>(`/api/v1/matter-queries/${matterId}/360`, signal),
};
