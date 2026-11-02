export type ApiErrorCode =
  | "network"
  | "timeout"
  | "aborted"
  | "contract"
  | "bad-request"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "rate-limited"
  | "server";

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  network: "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  timeout: "El servidor tardó demasiado en responder. Inténtalo de nuevo.",
  aborted: "La solicitud se canceló.",
  contract: "El servidor respondió con un formato inesperado.",
  "bad-request": "Revisa los datos ingresados.",
  unauthorized: "Tu sesión expiró. Inicia sesión de nuevo.",
  forbidden: "Tu cuenta no tiene permiso para esta acción.",
  "not-found": "No se encontró lo que buscabas.",
  conflict: "Ese registro ya existe.",
  "rate-limited": "Hiciste demasiados intentos. Espera un momento.",
  server: "El servidor falló al procesar la solicitud. Inténtalo de nuevo.",
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number | null;

  constructor(code: ApiErrorCode, options: { status?: number | null; message?: string } = {}) {
    super(options.message ?? DEFAULT_MESSAGES[code]);
    this.name = "ApiError";
    this.code = code;
    this.status = options.status ?? null;
  }

  get isTransient(): boolean {
    return this.code === "network" || this.code === "timeout" || this.code === "server";
  }
}

export function codeFromStatus(status: number): ApiErrorCode {
  if (status === 400 || status === 422) return "bad-request";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate-limited";
  return "server";
}
