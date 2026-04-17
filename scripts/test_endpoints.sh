#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SERVER_PID=""
cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" >/dev/null 2>&1; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "Starting server..."
node "${ROOT_DIR}/app.js" >/dev/null 2>&1 &
SERVER_PID="$!"

wait_for_server() {
  local attempts=40
  local i=1
  while [[ "${i}" -le "${attempts}" ]]; do
    if curl -sS "${BASE_URL}/tasks" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.1
    i=$((i + 1))
  done
  return 1
}

if ! wait_for_server; then
  echo "FAIL: server did not become ready at ${BASE_URL}"
  exit 1
fi

pass_count=0
fail_count=0

expect_status() {
  local name="$1"
  local method="$2"
  local url="$3"
  local expected="$4"
  local data="${5:-}"

  local tmp_body
  tmp_body="$(mktemp)"
  local status

  if [[ -n "${data}" ]]; then
    status="$(curl -sS -o "${tmp_body}" -w "%{http_code}" -X "${method}" \
      -H "content-type: application/json" \
      --data "${data}" \
      "${url}")"
  else
    status="$(curl -sS -o "${tmp_body}" -w "%{http_code}" -X "${method}" "${url}")"
  fi

  if [[ "${status}" == "${expected}" ]]; then
    echo "PASS: ${name} (${status})"
    pass_count=$((pass_count + 1))
    rm -f "${tmp_body}"
    return 0
  fi

  echo "FAIL: ${name} (expected ${expected}, got ${status})"
  echo "---- response body ----"
  cat "${tmp_body}" || true
  echo ""
  echo "-----------------------"
  rm -f "${tmp_body}"
  fail_count=$((fail_count + 1))
  return 1
}

expect_body_contains() {
  local name="$1"
  local method="$2"
  local url="$3"
  local expected_status="$4"
  local must_contain="$5"
  local data="${6:-}"

  local tmp_body
  tmp_body="$(mktemp)"
  local status

  if [[ -n "${data}" ]]; then
    status="$(curl -sS -o "${tmp_body}" -w "%{http_code}" -X "${method}" \
      -H "content-type: application/json" \
      --data "${data}" \
      "${url}")"
  else
    status="$(curl -sS -o "${tmp_body}" -w "%{http_code}" -X "${method}" "${url}")"
  fi

  if [[ "${status}" == "${expected_status}" ]] && grep -qF "${must_contain}" "${tmp_body}"; then
    echo "PASS: ${name} (${status})"
    pass_count=$((pass_count + 1))
    rm -f "${tmp_body}"
    return 0
  fi

  echo "FAIL: ${name} (expected ${expected_status} and body containing: ${must_contain})"
  echo "---- response body ----"
  cat "${tmp_body}" || true
  echo ""
  echo "-----------------------"
  rm -f "${tmp_body}"
  fail_count=$((fail_count + 1))
  return 1
}

create_task_and_get_id() {
  local title="$1"
  local tmp_body
  tmp_body="$(mktemp)"
  local status

  status="$(curl -sS -o "${tmp_body}" -w "%{http_code}" -X POST \
    -H "content-type: application/json" \
    --data "{\"title\":\"${title}\"}" \
    "${BASE_URL}/tasks")"

  if [[ "${status}" != "201" ]]; then
    echo "FAIL: POST /tasks (create_task_and_get_id) expected 201, got ${status}"
    echo "---- response body ----"
    cat "${tmp_body}" || true
    echo ""
    echo "-----------------------"
    rm -f "${tmp_body}"
    fail_count=$((fail_count + 1))
    return 1
  fi

  local id
  id="$(node -e "const fs=require('fs');const t=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(String(t.id ?? ''));" "${tmp_body}" 2>/dev/null || true)"
  rm -f "${tmp_body}"

  if [[ -z "${id}" ]]; then
    echo "FAIL: POST /tasks did not return an id"
    fail_count=$((fail_count + 1))
    return 1
  fi

  echo "${id}"
}

echo ""
echo "Running endpoint tests against ${BASE_URL}..."

# GET /tasks
expect_status "GET /tasks" "GET" "${BASE_URL}/tasks" "200"

# GET /tasks/:id
expect_status "GET /tasks/1" "GET" "${BASE_URL}/tasks/1" "200"
expect_status "GET /tasks/99999 (missing)" "GET" "${BASE_URL}/tasks/99999" "404"

# POST /tasks
expect_body_contains "POST /tasks (missing title)" "POST" "${BASE_URL}/tasks" "400" "\"title is required\"" "{}"
expect_body_contains "POST /tasks (valid)" "POST" "${BASE_URL}/tasks" "201" "\"title\":\"Buy milk\"" "{\"title\":\"Buy milk\"}"

created_id="$(create_task_and_get_id "Temp delete me")"
expect_status "DELETE /tasks/${created_id}" "DELETE" "${BASE_URL}/tasks/${created_id}" "204"
expect_status "DELETE /tasks/99999 (missing)" "DELETE" "${BASE_URL}/tasks/99999" "404"

echo ""
echo "Done. Passed: ${pass_count}, Failed: ${fail_count}"

if [[ "${fail_count}" -gt 0 ]]; then
  exit 1
fi

