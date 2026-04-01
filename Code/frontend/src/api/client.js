const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

export async function requestJson(
  path,
  { method = "GET", headers = {}, body, fallback } = {},
) {
  const url = `${DEFAULT_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
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

  try {
    const response = await fetch(url, requestInit);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (fallback !== undefined) {
      return typeof fallback === "function" ? fallback() : fallback;
    }

    throw error;
  }
}
