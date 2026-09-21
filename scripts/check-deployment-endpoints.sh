#!/usr/bin/env bash

set -euo pipefail

trim_url() {
  local value="$1"
  value="${value//$'\r'/}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

check_endpoint() {
  local endpoint_name="$1"
  local raw_url="$2"
  local required="$3"
  local endpoint_url

  endpoint_url="$(trim_url "$raw_url")"

  if [[ -z "$endpoint_url" ]]; then
    if [[ "$required" == "true" ]]; then
      echo "::error::$endpoint_name is required for production deployment verification." >&2
      return 1
    fi
    echo "$endpoint_name is not configured; skipping."
    return 0
  fi

  case "$endpoint_url" in
    http://?* | https://?*) ;;
    *)
      echo "::error::$endpoint_name must be an absolute HTTP(S) URL." >&2
      return 1
      ;;
  esac

  echo "Checking $endpoint_name..."
  for attempt in {1..12}; do
    if curl --fail --show-error --silent --location \
      --connect-timeout 10 --max-time 30 \
      "$endpoint_url" > /dev/null; then
      echo "$endpoint_name passed."
      return 0
    fi
    echo "$endpoint_name attempt $attempt/12 failed; retrying in 10 seconds."
    sleep 10
  done

  echo "::error::$endpoint_name did not become healthy: $endpoint_url" >&2
  return 1
}

check_endpoint DEPLOY_API_HEALTH_URL "${DEPLOY_API_HEALTH_URL:-}" true
check_endpoint DEPLOY_WEB_URL "${DEPLOY_WEB_URL:-}" false
check_endpoint DEPLOY_ADMIN_URL "${DEPLOY_ADMIN_URL:-}" false
check_endpoint DEPLOY_PLATFORM_ADMIN_URL "${DEPLOY_PLATFORM_ADMIN_URL:-}" false
