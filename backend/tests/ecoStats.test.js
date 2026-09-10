import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { getEcoStats } from "../controllers/ecoController.js";
import EcoImpact from "../models/EcoImpact.js";

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

describe("getEcoStats - Aggregation & Leaderboard Integrity", () => {
  it("returns zeroed community stats and empty leaderboard when collection is empty", async () => {
    mock.method(EcoImpact, "aggregate", async () => []);

    const req = { userId: null };
    const res = mockResponse();

    await getEcoStats(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.deepEqual(res.jsonData.community, {
      totalCarbonSavedKg: 0,
      totalBottlesPrevented: 0,
      totalLocalSpentUSD: 0,
      totalActionsLogged: 0,
      greenExplorersCount: 0,
      treesEquivalent: 0,
    });
    assert.deepEqual(res.jsonData.leaderboard, []);

    mock.reset();
  });

  it("returns exact aggregated community stats without hardcoded inflation", async () => {
    const mockAggCommunity = [
      {
        totalCarbonSavedKg: 100,
        totalBottlesPrevented: 50,
        totalLocalSpentUSD: 200,
        totalActionsLogged: 10,
        uniqueUsers: ["user1", "user2"],
      },
    ];

    const mockAggLeaderboard = [
      {
        _id: "user1",
        name: "Real User One",
        carbon: 60,
        bottles: 30,
        localSpent: 120,
        totalScore: 330,
      },
    ];

    mock.method(EcoImpact, "aggregate", async (pipeline) => {
      // Differentiate pipeline by presence of $lookup or $group structure
      const isLeaderboard = pipeline.some((stage) => stage.$lookup || (stage.$match && stage.$match.user));
      return isLeaderboard ? mockAggLeaderboard : mockAggCommunity;
    });

    const req = { userId: null };
    const res = mockResponse();

    await getEcoStats(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.deepEqual(res.jsonData.community, {
      totalCarbonSavedKg: 100,
      totalBottlesPrevented: 50,
      totalLocalSpentUSD: 200,
      totalActionsLogged: 10,
      greenExplorersCount: 2,
      treesEquivalent: 5, // Math.round(100 / 21) = 5
    });
    assert.equal(res.jsonData.leaderboard.length, 1);
    assert.equal(res.jsonData.leaderboard[0].name, "Real User One");
    assert.equal(res.jsonData.leaderboard[0].score, 330);

    mock.reset();
  });
});
