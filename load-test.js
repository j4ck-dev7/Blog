import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 300 },
    { duration: "3m", target: 1040 },
    { duration: "5m", target: 1040 },
    { duration: "1m", target: 0 },
  ],

  thresholds: {
    http_req_duration: ["p(90)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res1 = http.get("http://localhost:80/app/main");
  check(res1, { "homepage status 200": (r) => r.status === 200 });

  sleep(4);
}
