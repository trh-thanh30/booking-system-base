function normalizeCorsOrigin(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map(normalizeCorsOrigin)
    .filter((origin): origin is string => Boolean(origin));
}

export function isCorsOriginAllowed(
  requestOrigin: string | undefined,
  configuredOrigins: readonly string[],
  adminWorkspaceUrl: string,
): boolean {
  if (!requestOrigin) return true;

  const normalizedOrigin = normalizeCorsOrigin(requestOrigin);
  if (!normalizedOrigin) return false;

  const exactOrigins = new Set(
    configuredOrigins
      .map(normalizeCorsOrigin)
      .filter((origin): origin is string => Boolean(origin)),
  );
  if (exactOrigins.has(normalizedOrigin)) return true;

  const workspaceOrigin = normalizeCorsOrigin(adminWorkspaceUrl);
  if (!workspaceOrigin) return false;

  const requestUrl = new URL(normalizedOrigin);
  const workspaceUrl = new URL(workspaceOrigin);
  if (
    requestUrl.protocol !== workspaceUrl.protocol ||
    requestUrl.port !== workspaceUrl.port
  ) {
    return false;
  }
  if (requestUrl.origin === workspaceUrl.origin) return true;
  if (workspaceUrl.hostname === 'localhost') return false;

  const suffix = `.${workspaceUrl.hostname}`;
  if (!requestUrl.hostname.endsWith(suffix)) return false;

  const tenantSlug = requestUrl.hostname.slice(0, -suffix.length);
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(tenantSlug);
}
