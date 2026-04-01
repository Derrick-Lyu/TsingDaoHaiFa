const DEFAULT_API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "/api";

export function buildApiUrl(path, baseUrl = DEFAULT_API_BASE_URL) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (
    normalizedBaseUrl &&
    normalizedBaseUrl !== "/" &&
    normalizedPath === normalizedBaseUrl
  ) {
    return normalizedBaseUrl;
  }

  if (
    normalizedBaseUrl &&
    normalizedBaseUrl !== "/" &&
    normalizedPath.startsWith(`${normalizedBaseUrl}/`)
  ) {
    return normalizedPath;
  }

  return `${normalizedBaseUrl}${normalizedPath}`;
}

export async function requestJson(
  path,
  { method = "GET", headers = {}, body } = {},
) {
  const url = buildApiUrl(path);
  const requestInit = {
    method,
    headers: {
      ...headers,
    },
  };

  if (body !== undefined) {
    requestInit.headers = {
      "Content-Type": "application/json",
      ...requestInit.headers,
    };
    requestInit.body =
      typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(url, requestInit);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}
