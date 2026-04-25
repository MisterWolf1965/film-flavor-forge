import { supabase } from "./client";

/**
 * Wrapper around `supabase.functions.invoke` that adds the shared `x-app-secret`
 * header required by all sensitive edge functions in this project.
 *
 * The secret is read from the Vite build env `VITE_APP_SECRET`. It must be
 * configured as a workspace build secret with the same value as the runtime
 * `APP_SECRET` secret used by the edge functions.
 */
export const APP_SECRET = (import.meta.env.VITE_APP_SECRET as string | undefined) ?? "";

type InvokeOptions = Parameters<typeof supabase.functions.invoke>[1];

export function invokeSecureFunction<T = unknown>(
  name: string,
  options: InvokeOptions = {}
) {
  const headers = {
    ...(options?.headers ?? {}),
    "x-app-secret": APP_SECRET,
  };
  return supabase.functions.invoke<T>(name, { ...options, headers });
}

/**
 * Direct fetch helper for endpoints that need multipart/form-data (file uploads),
 * which `supabase.functions.invoke` does not handle reliably.
 */
export async function postSecureFormData(name: string, formData: FormData) {
  const baseUrl = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, "");
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const res = await fetch(`${baseUrl}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
      "x-app-secret": APP_SECRET,
    },
    body: formData,
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string")
        ? (data as { error: string }).error
        : `Upload failed (HTTP ${res.status})`;
    throw new Error(message);
  }
  return data;
}