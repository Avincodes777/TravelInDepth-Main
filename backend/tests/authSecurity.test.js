import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { signup, login } from "../controllers/authController.js";
import { authRateLimit } from "../middleware/rateLimiter.js";
import User from "../models/User.js";

function mockResponse() {
  const res = {};
  res.statusCode = null;
  res.jsonData = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
}

describe("Auth Security & Input Hardening", () => {
  it("rejects non-string or malicious object email payloads on login", async () => {
    const req = {
      body: {
        email: { $ne: null },
        password: "password123",
      },
    };
    const res = mockResponse();

    await login(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.jsonData.message, /valid text strings/i);
  });

  it("rejects invalid email formats on signup", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "not-an-email",
        password: "validPassword123",
      },
    };
    const res = mockResponse();

    await signup(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.jsonData.message, /valid email address/i);
  });

  it("rate limits rapid repeated auth requests per IP", () => {
    const ip = "192.168.1.100";
    let nextCalled = 0;
    const next = () => {
      nextCalled++;
    };

    let lastRes;
    for (let i = 0; i < 20; i++) {
      const req = { ip, headers: {} };
      const res = mockResponse();
      lastRes = res;
      authRateLimit(req, res, next);
    }

    assert.equal(nextCalled, 15);
    assert.equal(lastRes.statusCode, 429);
    assert.match(lastRes.jsonData.message, /Too many authentication attempts/i);
  });
});
