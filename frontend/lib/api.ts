export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  /** The underlying Response, so callers can inspect status/headers. */
  response: Response;

  /** The parsed JSON body when the response carried one (e.g. a 422 payload). */
  body?: unknown;

  constructor(message: string, response: Response, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.response = response;
    this.body = body;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  /** JSON-serializable request body; sent with `Content-Type: application/json`. */
  body?: unknown;
};

/** Fetch a JSON endpoint on the REST API, throwing {@link ApiError} on non-2xx. */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let body: unknown;

    try {
      body = await response.json();
    } catch {
      // Response was not JSON; the status is all the information we have.
    }

    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText} (${path})`,
      response,
      body,
    );
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
