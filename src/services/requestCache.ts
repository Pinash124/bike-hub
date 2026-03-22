type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

function getAuthScope(): string {
  if (typeof window === "undefined") return "anon";
  try {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return "anon";
    const user = JSON.parse(userRaw) as {
      id?: string;
      username?: string;
      role?: string;
      roles?: Array<{ name?: string }>;
    };
    const role = user?.role || user?.roles?.[0]?.name || "unknown-role";
    const id = user?.id || user?.username || "unknown-user";
    return `${String(role).toLowerCase()}:${id}`;
  } catch {
    return "anon";
  }
}

export function buildScopedCacheKey(namespace: string, ...parts: string[]) {
  const scope = getAuthScope();
  const suffix = parts.filter(Boolean).join(":");
  return suffix ? `${namespace}:${scope}:${suffix}` : `${namespace}:${scope}`;
}

export async function withRequestCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 15_000,
): Promise<T> {
  const now = Date.now();
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const request = fetcher()
    .then((result) => {
      responseCache.set(key, { value: result, expiresAt: Date.now() + ttlMs });
      return result;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request as Promise<unknown>);
  return request;
}

export function invalidateRequestCache(prefix?: string) {
  if (!prefix) {
    responseCache.clear();
    inFlight.clear();
    return;
  }

  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) {
      responseCache.delete(key);
    }
  }

  for (const key of inFlight.keys()) {
    if (key.startsWith(prefix)) {
      inFlight.delete(key);
    }
  }
}
