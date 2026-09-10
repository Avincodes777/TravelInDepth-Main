import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { ecoActionRateLimit } from "../middleware/rateLimiter.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

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

describe("POST /api/eco/sync-feeds Auth & ecoActionRateLimit Tests", () => {
  it("requireAuth rejects unauthenticated requests with 401", async () => {
    const req = { headers: {} };
    const res = mockResponse();
    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it("requireAdmin rejects non-admin users with 403", async () => {
    mock.method(User, "findById", async () => ({
      _id: "user_normal",
      role: "user",
    }));

    const req = { userId: "user_normal" };
    const res = mockResponse();
    let nextCalled = false;

    await requireAdmin(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 403);
    assert.equal(nextCalled, false);

    mock.reset();
  });

  it("requireAdmin allows admin users to proceed", async () => {
    mock.method(User, "findById", async () => ({
      _id: "user_admin",
      role: "admin",
    }));

    const req = { userId: "user_admin" };
    const res = mockResponse();
    let nextCalled = false;

    await requireAdmin(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, null);

    mock.reset();
  });

  it("ecoActionRateLimit throttles burst submissions after exceeding cap", async () => {
    const testIp = "test-rate-limit-ip-" + Date.now();
    let blocked = false;
    let blockedIndex = -1;

    for (let i = 0; i < 15; i++) {
      const req = { ip: testIp, headers: {} };
      const res = mockResponse();
      let nextCalled = false;

      ecoActionRateLimit(req, res, () => {
        nextCalled = true;
      });

      if (!nextCalled && res.statusCode === 429) {
        blocked = true;
        blockedIndex = i;
        break;
      }
    }

    assert.equal(blocked, true);
    assert.equal(blockedIndex, 10); // 11th request (0-indexed 10) should be blocked when limit is 10
  });
});
