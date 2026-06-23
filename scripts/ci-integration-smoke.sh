#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
COOKIE_JAR="${RUNNER_TEMP:-/tmp}/pos-fnb-cookies.txt"
LOGIN_BODY="${RUNNER_TEMP:-/tmp}/pos-fnb-login-response.json"

wait_for_route() {
  local path="$1"
  local expected="$2"

  for attempt in $(seq 1 30); do
    local status
    status="$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}${path}" || true)"
    if [[ "$status" == "$expected" ]]; then
      return 0
    fi
    echo "Waiting for ${path}: got ${status}, expected ${expected} (${attempt}/30)"
    sleep 2
  done

  echo "Route ${path} did not return ${expected}" >&2
  return 1
}

assert_authenticated_route() {
  local path="$1"
  local status

  status="$(curl -sS -b "$COOKIE_JAR" -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")"
  if [[ "$status" != "200" ]]; then
    echo "Authenticated route ${path} returned ${status}, expected 200" >&2
    return 1
  fi
}

rm -f "$COOKIE_JAR" "$LOGIN_BODY"

wait_for_route "/login" "200"

csrf_token="$(
  curl -sS -c "$COOKIE_JAR" "${BASE_URL}/api/auth/csrf" \
    | node -e 'let body = ""; process.stdin.on("data", chunk => body += chunk); process.stdin.on("end", () => process.stdout.write(JSON.parse(body).csrfToken || ""));'
)"

if [[ -z "$csrf_token" ]]; then
  echo "Could not fetch NextAuth CSRF token" >&2
  exit 1
fi

login_status="$(
  curl -sS -b "$COOKIE_JAR" -c "$COOKIE_JAR" -o "$LOGIN_BODY" -w "%{http_code}" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "username=admin" \
    --data-urlencode "password=admin123" \
    --data-urlencode "csrfToken=${csrf_token}" \
    --data-urlencode "callbackUrl=${BASE_URL}/dashboard" \
    --data-urlencode "json=true" \
    "${BASE_URL}/api/auth/callback/credentials"
)"

if [[ "$login_status" != "200" && "$login_status" != "302" ]]; then
  echo "Login returned ${login_status}, expected 200 or 302" >&2
  cat "$LOGIN_BODY" >&2
  exit 1
fi

assert_authenticated_route "/dashboard"
assert_authenticated_route "/order"
assert_authenticated_route "/inventory"
assert_authenticated_route "/reports"

echo "Integration smoke passed: login, auth session and protected POS routes are reachable."
