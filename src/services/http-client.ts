import { ApiError, codeFromStatus } from "@/services/api-error";
import { isRecord } from "@/lib/records";

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  authenticated?: boolean;
  retries?: number;
  timeoutMs?: number;
}

export interface HttpClientConfig {
  baseUrl: string;
  getToken: () => string | null;
  onUnauthorized: () => void;
  defaultTimeoutMs?: number;
}

export interface HttpClient {
  request<TResponse>(path: string, options?: RequestOptions): Promise<TResponse>;
}

function buildUrl(baseUrl: string, path: string, query: RequestOptions["query"]): string {
  const url = new URL(`${baseUrl}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function serverMessage(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;
  const { message } = payload;
  if (Array.isArray(message)) return message.filter((item) => typeof item === "string").join(". ");
  return typeof message === "string" ? message : undefined;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function waitFor(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new ApiError("aborted"));
      },
      { once: true },
    );
  });
}

function toTransportError(cause: unknown, callerSignal?: AbortSignal): ApiError {
  if (cause instanceof ApiError) return cause;
  if (callerSignal?.aborted) return new ApiError("aborted");
  if (cause instanceof DOMException && cause.name === "TimeoutError") return new ApiError("timeout");
  return new ApiError("network");
}

export function createHttpClient(config: HttpClientConfig): HttpClient {
  const { baseUrl, getToken, onUnauthorized, defaultTimeoutMs = 20_000 } = config;

  async function attempt<TResponse>(path: string, options: RequestOptions): Promise<TResponse> {
    const { method = "GET", query, body, signal, authenticated = true, timeoutMs = defaultTimeoutMs } = options;
    const headers = new Headers({ Accept: "application/json" });
    const token = authenticated ? getToken() : null;

    if (body !== undefined) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const timeoutSignal = AbortSignal.timeout(timeoutMs);

    let response: Response;
    try {
      response = await fetch(buildUrl(baseUrl, path, query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
      });
    } catch (cause) {
      throw toTransportError(cause, signal);
    }

    const payload = await readPayload(response).catch((cause: unknown) => {
      throw toTransportError(cause, signal);
    });

    if (response.ok) return payload as TResponse;

    const code = codeFromStatus(response.status);
    if (code === "unauthorized" && authenticated) onUnauthorized();
    const message = code === "server" ? undefined : serverMessage(payload);
    throw new ApiError(code, { status: response.status, message });
  }

  return {
    async request<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
      const isIdempotent = (options.method ?? "GET") === "GET";
      const maxRetries = isIdempotent ? (options.retries ?? 2) : 0;

      for (let tries = 0; ; tries += 1) {
        try {
          return await attempt<TResponse>(path, options);
        } catch (cause) {
          const error = toTransportError(cause, options.signal);
          if (!error.isTransient || tries >= maxRetries) throw error;
          await waitFor(300 * 2 ** tries, options.signal);
        }
      }
    },
  };
}
