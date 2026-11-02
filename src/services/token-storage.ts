const TOKEN_KEY = "reservas.auth.token";

export type ClearReason = "logout" | "expired";

type Listener = () => void;

const listeners = new Set<Listener>();
let lastClearReason: ClearReason | null = null;

function notify(): void {
  listeners.forEach((listener) => listener());
}

export const tokenStorage = {
  get(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set(token: string): void {
    lastClearReason = null;
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } finally {
      notify();
    }
  },

  clear(reason: ClearReason): void {
    lastClearReason = reason;
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } finally {
      notify();
    }
  },

  consumeClearReason(): ClearReason | null {
    const reason = lastClearReason;
    lastClearReason = null;
    return reason;
  },

  subscribe(listener: Listener): () => void {
    const onStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY || event.key === null) listener();
    };
    listeners.add(listener);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};
