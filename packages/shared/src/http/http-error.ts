import { AxiosError } from "axios";
import { HttpClientError, type HttpClientAxiosError } from "./http.types.ts";

function getApiError(error: HttpClientAxiosError) {
  const apiError = error.response?.data?.error;
  return typeof apiError === "object" && apiError !== null
    ? apiError
    : undefined;
}

function resolveMessage(error: HttpClientAxiosError): string {
  const data = error.response?.data;
  const apiError = getApiError(error);

  if (typeof apiError?.message === "string") return apiError.message;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (error.message) return error.message;

  return "Request failed";
}

export function toHttpClientError(error: unknown): HttpClientError {
  if (error instanceof HttpClientError) return error;

  if (error instanceof AxiosError) {
    const axiosError = error as HttpClientAxiosError;

    return new HttpClientError({
      message: resolveMessage(axiosError),
      status: axiosError.response?.status,
      code: getApiError(axiosError)?.code ?? axiosError.code,
      details:
        getApiError(axiosError)?.details ??
        axiosError.response?.data?.details ??
        axiosError.response?.data,
      isNetworkError: !axiosError.response,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new HttpClientError({
      message: error.message,
      isNetworkError: false,
      cause: error,
    });
  }

  return new HttpClientError({
    message: String(error),
    isNetworkError: false,
    cause: error,
  });
}
