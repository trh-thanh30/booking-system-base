import axios, { AxiosHeaders } from "axios";
import { toHttpClientError } from "./http-error.ts";
import type {
  ApiClient,
  CreateHttpClientOptions,
  HttpClient,
  HttpRequestConfig,
} from "./http.types.ts";
import type { ApiResponse, PaginatedApiResponse } from "../types/index.ts";

export function createHttpClient(
  options: CreateHttpClientOptions = {},
): HttpClient {
  const client = axios.create({
    baseURL: options.baseURL,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
    timeout: options.timeout,
    withCredentials: options.withCredentials,
  });

  client.interceptors.request.use(async (config) => {
    const dynamicHeaders = await options.getHeaders?.();
    if (dynamicHeaders) {
      const headers = new AxiosHeaders(
        config.headers as ConstructorParameters<typeof AxiosHeaders>[0],
      );

      Object.entries(dynamicHeaders).forEach(([key, value]) => {
        if (value) {
          headers.set(key, value);
        }
      });

      config.headers = headers;
    }

    const token = await options.getAccessToken?.();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response.data,
    async (error: unknown) => {
      const httpError = toHttpClientError(error);

      if (httpError.status === 401) {
        const originalConfig = axios.isAxiosError(error)
          ? error.config
          : undefined;
        const retryConfig = originalConfig as
          | (HttpRequestConfig & { _retry?: boolean })
          | undefined;
        const nextToken = await options.onUnauthorized?.(httpError);

        if (nextToken && retryConfig && !retryConfig._retry) {
          retryConfig._retry = true;
          retryConfig.headers = new AxiosHeaders(
            retryConfig.headers as ConstructorParameters<
              typeof AxiosHeaders
            >[0],
          );
          retryConfig.headers.set("Authorization", `Bearer ${nextToken}`);

          return client.request(retryConfig);
        }
      }

      throw httpError;
    },
  );

  return client;
}

export function createApiClient(
  options: CreateHttpClientOptions = {},
): ApiClient {
  const client = createHttpClient(options);

  return {
    request<T>(config: HttpRequestConfig) {
      return client.request<unknown, ApiResponse<T>>(config);
    },
    get<T>(url: string, config?: HttpRequestConfig) {
      return client.get<unknown, ApiResponse<T>>(url, config);
    },
    delete<T>(url: string, config?: HttpRequestConfig) {
      return client.delete<unknown, ApiResponse<T>>(url, config);
    },
    post<T>(url: string, data?: unknown, config?: HttpRequestConfig) {
      return client.post<unknown, ApiResponse<T>>(url, data, config);
    },
    put<T>(url: string, data?: unknown, config?: HttpRequestConfig) {
      return client.put<unknown, ApiResponse<T>>(url, data, config);
    },
    patch<T>(url: string, data?: unknown, config?: HttpRequestConfig) {
      return client.patch<unknown, ApiResponse<T>>(url, data, config);
    },
    paginated<T>(config: HttpRequestConfig) {
      return client.request<unknown, PaginatedApiResponse<T>>(config);
    },
  };
}

export function unwrapApiData<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === undefined) {
    throw new Error(response.message ?? "API response does not contain data");
  }

  return response.data;
}
