export type PlatformBridge = {
  getAccessToken: () => Promise<string | null>;
};

declare global {
  interface Window {
    IntegerPlatform?: PlatformBridge;
  }
}

export async function getPlatformAccessToken(): Promise<string> {
  if (typeof window === "undefined" || !window.IntegerPlatform) {
    throw new LegalApiError("platform_unavailable", 0, "Integer Platform Identity is unavailable.");
  }
  const token = await window.IntegerPlatform.getAccessToken();
  if (!token) throw new LegalApiError("authentication_required", 401, "Authentication is required.");
  return token;
}

export class LegalApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    public readonly correlationId?: string,
  ) {
    super(message);
    this.name = "LegalApiError";
  }
}
