import { afterEach, describe, expect, it, vi } from "vitest";

describe("Integer Platform authentication boundary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("never falls back to a persisted or fabricated token", async () => {
    vi.stubGlobal("window", {});
    const { getPlatformAccessToken } = await import("./platform-auth");
    await expect(getPlatformAccessToken()).rejects.toMatchObject({ code: "platform_unavailable" });
  });

  it("returns the short-lived token supplied by Integer Platform", async () => {
    vi.stubGlobal("window", { IntegerPlatform: { getAccessToken: vi.fn().mockResolvedValue("platform-token") } });
    const { getPlatformAccessToken } = await import("./platform-auth");
    await expect(getPlatformAccessToken()).resolves.toBe("platform-token");
  });
});
