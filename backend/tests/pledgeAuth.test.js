import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { getUserPledges } from "../controllers/pledgeController.js";
import EcoPledge from "../models/EcoPledge.js";

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

describe("getUserPledges Authorization & Query Scoping", () => {
  it("returns 401 when request is unauthenticated (no req.userId)", async () => {
    const findSpy = mock.method(EcoPledge, "find", () => {});

    const req = { userId: undefined };
    const res = mockResponse();

    await getUserPledges(req, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.success, false);
    assert.equal(findSpy.mock.callCount(), 0);

    mock.reset();
  });

  it("queries strictly for req.userId when authenticated", async () => {
    let capturedQuery = null;
    mock.method(EcoPledge, "find", (query) => {
      capturedQuery = query;
      return {
        sort: () => ({
          limit: () => ({
            lean: async () => [
              {
                _id: "pledge_1",
                user: "user_123",
                tripDestination: "Ladakh",
                pledges: ["No Plastic"],
              },
            ],
          }),
        }),
      };
    });

    const req = { userId: "user_123" };
    const res = mockResponse();

    await getUserPledges(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.deepEqual(capturedQuery, { user: "user_123" });
    assert.equal(res.jsonData.data.length, 1);

    mock.reset();
  });
});
