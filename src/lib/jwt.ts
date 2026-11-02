import type { SessionUser } from "@/types/auth";
import type { UnknownRecord } from "@/types/api";
import { firstNumber, firstString, isRecord } from "@/lib/records";

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwtClaims(token: string): UnknownRecord | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(payload));
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getExpiryMs(claims: UnknownRecord): number | null {
  const exp = firstNumber(claims, ["exp"]);
  return exp === null ? null : exp * 1000;
}

export function isTokenUsable(token: string, now = Date.now()): boolean {
  const claims = decodeJwtClaims(token);
  if (!claims) return false;
  const expiry = getExpiryMs(claims);
  return expiry === null || expiry > now;
}

export function userFromClaims(claims: UnknownRecord): SessionUser {
  const roles = claims.roles;
  const firstRole = Array.isArray(roles) && typeof roles[0] === "string" ? roles[0] : null;
  const email = firstString(claims, ["email", "correo"]);
  return {
    id: firstString(claims, ["sub", "id", "userId"]),
    name: firstString(claims, ["name", "nombre", "username", "fullName"]) ?? email?.split("@")[0] ?? "Usuario",
    email,
    role: firstRole ?? firstString(claims, ["role", "rol"]),
  };
}
