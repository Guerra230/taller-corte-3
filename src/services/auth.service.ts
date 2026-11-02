import { api } from "@/services/api";
import { ApiError } from "@/services/api-error";
import { ENDPOINTS } from "@/services/endpoints";
import { decodeJwtClaims } from "@/lib/jwt";
import { firstString, isRecord } from "@/lib/records";
import type { LoginCredentials, RegisterPayload } from "@/types/auth";

const TOKEN_FIELDS = ["access_token", "accessToken", "token", "jwt"] as const;

function extractToken(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const direct = firstString(payload, TOKEN_FIELDS);
  if (direct) return direct;
  return isRecord(payload.data) ? firstString(payload.data, TOKEN_FIELDS) : null;
}

function assertJwt(token: string | null): string {
  if (!token || !decodeJwtClaims(token)) {
    throw new ApiError("contract", { message: "El servidor no devolvió un token de sesión válido." });
  }
  return token;
}

function withMessage(error: unknown, code: ApiError["code"], message: string): unknown {
  return error instanceof ApiError && error.code === code
    ? new ApiError(code, { status: error.status, message })
    : error;
}

export async function login(credentials: LoginCredentials): Promise<string> {
  try {
    const payload = await api.request<unknown>(ENDPOINTS.login, {
      method: "POST",
      body: credentials,
      authenticated: false,
    });
    return assertJwt(extractToken(payload));
  } catch (error) {
    throw withMessage(error, "unauthorized", "El correo o la contraseña no coinciden.");
  }
}

export async function register(data: RegisterPayload): Promise<string | null> {
  try {
    const payload = await api.request<unknown>(ENDPOINTS.register, {
      method: "POST",
      body: data,
      authenticated: false,
    });
    const token = extractToken(payload);
    return token ? assertJwt(token) : null;
  } catch (error) {
    throw withMessage(error, "conflict", "Ya existe una cuenta con ese correo. Inicia sesión.");
  }
}
