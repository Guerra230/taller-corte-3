export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  name: string;
}

export interface SessionUser {
  id: string | null;
  name: string;
  email: string | null;
  role: string | null;
}

export type AuthStatus = "resolving" | "authenticated" | "anonymous";

export type RegisterOutcome = "signed-in" | "needs-login";
