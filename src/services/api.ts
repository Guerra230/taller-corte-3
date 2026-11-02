import { API_URL } from "@/lib/env";
import { createHttpClient } from "@/services/http-client";
import { tokenStorage } from "@/services/token-storage";

export const api = createHttpClient({
  baseUrl: API_URL,
  getToken: () => tokenStorage.get(),
  onUnauthorized: () => tokenStorage.clear("expired"),
});
