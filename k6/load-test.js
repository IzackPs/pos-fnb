import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const loginDuration = new Trend("login_duration", true);
const dashboardDuration = new Trend("dashboard_duration", true);
const errorRate = new Rate("errors");
const isCiProfile = __ENV.LOAD_TEST_PROFILE === "ci";

export const options = {
  stages: isCiProfile ? [
    { duration: "5s", target: 5 },
    { duration: "10s", target: 5 },
    { duration: "5s", target: 0 },
  ] : [
    { duration: "30s", target: 10 },
    { duration: "1m",  target: 10 },
    { duration: "30s", target: 25 },
    { duration: "1m",  target: 25 },
    { duration: "30s", target: 0  },
  ],
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "max"],
  thresholds: {
    http_req_duration:  ["p(95)<1000"],
    http_req_failed:    ["rate<0.01"],
    login_duration:     ["p(95)<2000"],
    dashboard_duration: ["p(95)<1000"],
    errors:             ["rate<0.01"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:3000";

function getCsrfToken() {
  const res = http.get(`${BASE}/api/auth/csrf`);
  check(res, { "csrf 200": (r) => r.status === 200 });
  try {
    return JSON.parse(res.body).csrfToken;
  } catch {
    return "";
  }
}

function login() {
  const csrf = getCsrfToken();
  const start = Date.now();
  const res = http.post(
    `${BASE}/api/auth/callback/credentials`,
    {
      username: "admin",
      password: "admin123",
      csrfToken: csrf,
      callbackUrl: `${BASE}/dashboard`,
      json: "true",
    },
    { redirects: 0 },
  );
  loginDuration.add(Date.now() - start);

  const ok = check(res, {
    "login redirects": (r) => r.status === 302 || r.status === 200,
  });
  errorRate.add(!ok);
  return res.cookies;
}

export default function runLoadScenario() {
  const cookies = login();

  const jar = http.cookieJar();
  if (cookies) {
    for (const [name, vals] of Object.entries(cookies)) {
      jar.set(BASE, name, vals[0].value);
    }
  }

  const start = Date.now();
  const dash = http.get(`${BASE}/dashboard`);
  dashboardDuration.add(Date.now() - start);

  const ok = check(dash, {
    "dashboard 200": (r) => r.status === 200 || r.status === 302,
  });
  errorRate.add(!ok);

  http.get(`${BASE}/order`);
  http.get(`${BASE}/inventory`);

  sleep(1);
}
