import { supabaseClient } from "./supabaseClient";

type Cached = { userId: string; role: "admin" | "user"; expiry: number };
let cache: Cached | null = null;
const TTL_MS = 5_000;

export function clearRoleCache() {
  cache = null;
}

export async function getCachedRole(): Promise<"admin" | "user" | null> {
  try {
    const { data: authData } = await (supabaseClient as any).auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) {
      cache = null;
      return null;
    }

    const now = Date.now();
    if (cache && cache.userId === userId && now < cache.expiry) {
      return cache.role;
    }

    const { data: profile } = await (supabaseClient as any)
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    const role = (profile?.role as "admin" | "user") ?? "user";
    cache = { userId, role, expiry: now + TTL_MS };
    return role;
  } catch {
    return "user";
  }
}
