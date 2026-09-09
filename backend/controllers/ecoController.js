import EcoImpact from "../models/EcoImpact.js";
import User from "../models/User.js";

/**
 * Calculate ecoBadgeLevel based on total accumulated metrics
 */
export const computeBadgeLevel = (carbonSaved, bottles, localSpent) => {
  // Point system: 1kg CO2 = 2 pts, 1 bottle = 3 pts, $1 spent local = 1 pt
  const totalScore = (carbonSaved * 2) + (bottles * 3) + (localSpent * 1);

  if (totalScore >= 150) {
    return "Planet Guardian";
  } else if (totalScore >= 50) {
    return "Green Voyager";
  }
  return "Eco-Novice";
};

/**
 * GET /api/eco/stats
 * Aggregate and return global community stats & leaderboard + user profile if authenticated
 */
export const getEcoStats = async (req, res) => {
  try {
    // 1. Community Aggregation
    const totalAgg = await EcoImpact.aggregate([
      {
        $group: {
          _id: null,
          totalCarbonSavedKg: { $sum: "$carbonSavedKg" },
          totalBottlesPrevented: { $sum: "$bottlesPrevented" },
          totalLocalSpentUSD: { $sum: "$localSpentUSD" },
          totalActionsLogged: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" },
        },
      },
    ]);

    // Baseline stats so new platforms look active & inspiring
    const baseCarbon = 4280;
    const baseBottles = 12600;
    const baseLocalSpent = 18450;
    const baseActions = 640;
    const baseUsers = 320;

    let totalCarbonSavedKg = baseCarbon;
    let totalBottlesPrevented = baseBottles;
    let totalLocalSpentUSD = baseLocalSpent;
    let totalActionsLogged = baseActions;
    let greenExplorersCount = baseUsers;

    if (totalAgg.length > 0) {
      const agg = totalAgg[0];
      totalCarbonSavedKg += agg.totalCarbonSavedKg || 0;
      totalBottlesPrevented += agg.totalBottlesPrevented || 0;
      totalLocalSpentUSD += agg.totalLocalSpentUSD || 0;
      totalActionsLogged += agg.totalActionsLogged || 0;
      const validUsers = (agg.uniqueUsers || []).filter(Boolean);
      greenExplorersCount += validUsers.length;
    }

    // 2. User Specific Metrics (if authenticated)
    let userStats = {
      carbonSavedKg: 0,
      bottlesPrevented: 0,
      localSpentUSD: 0,
      ecoScore: 0,
      ecoBadgeLevel: "Eco-Novice",
      nextTierThreshold: 50,
      progressPercent: 0,
      actionsLogged: 0,
      recentActions: [],
    };

    if (req.userId) {
      const userActions = await EcoImpact.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const userAgg = await EcoImpact.aggregate([
        { $match: { user: req.userId } },
        {
          $group: {
            _id: null,
            carbon: { $sum: "$carbonSavedKg" },
            bottles: { $sum: "$bottlesPrevented" },
            localSpent: { $sum: "$localSpentUSD" },
            count: { $sum: 1 },
          },
        },
      ]);

      if (userAgg.length > 0) {
        const u = userAgg[0];
        const carbon = u.carbon || 0;
        const bottles = u.bottles || 0;
        const local = u.localSpent || 0;
        const score = Math.round(carbon * 2 + bottles * 3 + local * 1);
        const badge = computeBadgeLevel(carbon, bottles, local);

        let nextThreshold = 50;
        let progress = Math.min(Math.round((score / 50) * 100), 100);

        if (badge === "Green Voyager") {
          nextThreshold = 150;
          progress = Math.min(
            Math.round(((score - 50) / (150 - 50)) * 100),
            100
          );
        } else if (badge === "Planet Guardian") {
          nextThreshold = 500;
          progress = 100;
        }

        userStats = {
          carbonSavedKg: Number(carbon.toFixed(1)),
          bottlesPrevented: bottles,
          localSpentUSD: Number(local.toFixed(1)),
          ecoScore: score,
          ecoBadgeLevel: badge,
          nextTierThreshold: nextThreshold,
          progressPercent: progress,
          actionsLogged: u.count || 0,
          recentActions: userActions,
        };
      }
    }

    // 3. Community Leaderboard (Top 5 users or featured green champions)
    const leaderboardAgg = await EcoImpact.aggregate([
      { $match: { user: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$user",
          carbon: { $sum: "$carbonSavedKg" },
          bottles: { $sum: "$bottlesPrevented" },
          localSpent: { $sum: "$localSpentUSD" },
          totalActions: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          carbon: 1,
          bottles: 1,
          localSpent: 1,
          totalScore: {
            $add: [
              { $multiply: ["$carbon", 2] },
              { $multiply: ["$bottles", 3] },
              { $multiply: ["$localSpent", 1] },
            ],
          },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 5 },
    ]);

    const fallbackLeaderboard = [
      { name: "Ananya Deshmukh", score: 480, badge: "Planet Guardian", carbon: 180, bottles: 60 },
      { name: "Vikramaditya Roy", score: 340, badge: "Planet Guardian", carbon: 120, bottles: 45 },
      { name: "Sneha Kapur", score: 195, badge: "Planet Guardian", carbon: 75, bottles: 30 },
      { name: "Rohan Varma", score: 110, badge: "Green Voyager", carbon: 40, bottles: 18 },
      { name: "Kavita Nair", score: 85, badge: "Green Voyager", carbon: 30, bottles: 15 },
    ];

    const topLeaderboard = leaderboardAgg.length > 0
      ? leaderboardAgg.map((item) => ({
          name: item.name,
          score: item.totalScore,
          carbon: item.carbon,
          bottles: item.bottles,
          badge: computeBadgeLevel(item.carbon, item.bottles, item.localSpent),
        }))
      : fallbackLeaderboard;

    return res.status(200).json({
      success: true,
      community: {
        totalCarbonSavedKg: Math.round(totalCarbonSavedKg),
        totalBottlesPrevented,
        totalLocalSpentUSD: Math.round(totalLocalSpentUSD),
        totalActionsLogged,
        greenExplorersCount,
        treesEquivalent: Math.round(totalCarbonSavedKg / 21), // ~21kg CO2 absorbed per tree/year
      },
      userStats,
      leaderboard: topLeaderboard,
    });
  } catch (error) {
    console.error("Error in getEcoStats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sustainability metrics.",
      error: error.message,
    });
  }
};

/**
 * POST /api/eco/log-action
 * Log a user green action & recalculate badges
 */
export const logEcoAction = async (req, res) => {
  try {
    const { actionType, title, carbonSavedKg, bottlesPrevented, localSpentUSD, notes } = req.body;

    const carbon = Number(carbonSavedKg) || 0;
    const bottles = Number(bottlesPrevented) || 0;
    const local = Number(localSpentUSD) || 0;

    if (carbon <= 0 && bottles <= 0 && local <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please specify at least one positive eco impact metric (carbon, bottles, or local spent).",
      });
    }

    const calculatedBadge = computeBadgeLevel(carbon, bottles, local);

    const newAction = await EcoImpact.create({
      user: req.userId || null,
      actionType: actionType || "custom",
      title: title || "Sustainable Travel Choice",
      carbonSavedKg: carbon,
      bottlesPrevented: bottles,
      localSpentUSD: local,
      ecoBadgeLevel: calculatedBadge,
      notes: notes ? notes.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "🌱 Great job! Your sustainable action has been logged.",
      data: newAction,
    });
  } catch (error) {
    console.error("Error in logEcoAction:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to log sustainable action.",
    });
  }
};
