"use client";

import type { PlatformBridge } from "./platform-auth";

type Discovery = { authorization_endpoint: string; token_endpoint: string; end_session_endpoint?: string };
export type AuthenticationSnapshot = { status: "loading" | "anonymous" | "authenticated" | "error"; message?: string };

const authority = (process.env.NEXT_PUBLIC_INTEGER_OIDC_AUTHORITY ?? "").replace(/\/$/, "");
const clientId = process.env.NEXT_PUBLIC_INTEGER_OIDC_CLIENT_ID ?? "";
const scope = process.env.NEXT_PUBLIC_INTEGER_OIDC_SCOPE ?? "openid profile";
const callbackKeys = ["integer.auth.verifier", "integer.auth.state", "integer.auth.return"] as const;
let accessToken: string | null = null;
let expiresAt = 0;
let snapshot: AuthenticationSnapshot = { status: "loading" };
const listeners = new Set<(value: AuthenticationSnapshot) => void>();

function publish(value: AuthenticationSnapshot) {
  snapshot = value;
  listeners.forEach((listener) => listener(value));
}

function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomValue() {
  return base64Url(crypto.getRandomValues(new Uint8Array(32)));
}

async function sha256(value: string) {
  return base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

async function discovery(): Promise<Discovery> {
  if (!authority || !clientId) throw new Error("Configuration OIDC locale incomplète.");
  const response = await fetch(`${authority}/.well-known/openid-configuration`);
  if (!response.ok) throw new Error("Le service d’identité Integer Platform est indisponible.");
  return response.json() as Promise<Discovery>;
}

async function completeCallback() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  if (!code) return false;
  const expectedState = sessionStorage.getItem(callbackKeys[1]);
  const verifier = sessionStorage.getItem(callbackKeys[0]);
  if (!expectedState || expectedState !== url.searchParams.get("state") || !verifier) throw new Error("Réponse OIDC invalide.");
  const metadata = await discovery();
  const body = new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, code, code_verifier: verifier, redirect_uri: `${window.location.origin}/` });
  const response = await fetch(metadata.token_endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error("La connexion OIDC n’a pas pu être finalisée.");
  const tokens = await response.json() as { access_token: string; expires_in?: number };
  accessToken = tokens.access_token;
  expiresAt = Date.now() + Math.max(0, (tokens.expires_in ?? 60) - 10) * 1000;
  const returnPath = sessionStorage.getItem(callbackKeys[2]) ?? "/";
  callbackKeys.forEach((key) => sessionStorage.removeItem(key));
  window.history.replaceState({}, "", returnPath);
  return true;
}

export const authentication = {
  snapshot: () => snapshot,
  subscribe(listener: (value: AuthenticationSnapshot) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  async initialize() {
    window.IntegerPlatform = { getAccessToken: async () => accessToken && Date.now() < expiresAt ? accessToken : null } satisfies PlatformBridge;
    try {
      const authenticated = await completeCallback();
      publish({ status: authenticated ? "authenticated" : "anonymous" });
    } catch (error) {
      publish({ status: "error", message: error instanceof Error ? error.message : "Erreur d’authentification." });
    }
  },
  async signIn() {
    const metadata = await discovery();
    const verifier = randomValue();
    const state = randomValue();
    sessionStorage.setItem(callbackKeys[0], verifier);
    sessionStorage.setItem(callbackKeys[1], state);
    sessionStorage.setItem(callbackKeys[2], `${window.location.pathname}${window.location.hash}`);
    const parameters = new URLSearchParams({ client_id: clientId, response_type: "code", scope, redirect_uri: `${window.location.origin}/`, state, code_challenge: await sha256(verifier), code_challenge_method: "S256" });
    window.location.assign(`${metadata.authorization_endpoint}?${parameters}`);
  },
  async signOut() {
    accessToken = null;
    expiresAt = 0;
    publish({ status: "anonymous" });
    window.location.assign("/");
  },
};
