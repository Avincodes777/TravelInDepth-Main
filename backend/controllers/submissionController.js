import DestinationSubmission from "../models/DestinationSubmission.js";
import Destination from "../models/Destination.js";
import User from "../models/User.js";
import { createNotification } from "../utils/createNotification.js";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

const buildVerificationPrompt = ({ name, state, region, bestSeason, budget, ecoOptions }) => `
You are a travel database verification assistant for an Indian travel platform.
Fact-check the following destination submission details:
- Destination Name: "${name}"
- State: "${state}"
- Region: "${region}"
- Best Season to visit: "${bestSeason}"
- Budget Tier: "${budget}"
- Eco-Travel Options: ${Array.isArray(ecoOptions) ? JSON.stringify(ecoOptions) : "None provided"}

Check:
1. Does this place exist in the stated Indian state and region?
2. Is the best season plausible for that location's climate?
3. Is the budget tier reasonable?
4. Are the eco-travel options plausible for that location?

Respond with ONLY a valid JSON object without markdown fences, formatted exactly as:
{
  "verified": true,
  "confidence": "high",
  "notes": "brief explanation of your verdict"
}
Note: "verified" must be boolean true or false. "confidence" must be "high", "medium", or "low".
`;

// Helper: generate kebab-case URL-safe slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// 1. Create a submission (User)
export const createSubmission = async (req, res) => {
  try {
    const {
      name,
      state,
      region,
      tagline,
      bestSeason,
      budget,
      ecoOptions,
      image,
      lat,
      lng,
    } = req.body || {};

    if (
      !name ||
      !state ||
      !region ||
      !tagline ||
      !bestSeason ||
      !budget ||
      !image ||
      lat === undefined ||
      lng === undefined
    ) {
      return res.status(400).json({
        message:
          "All required fields (name, state, region, tagline, bestSeason, budget, image, lat, lng) must be provided.",
      });
    }

    const slug = slugify(name);
    if (!slug) {
      return res.status(400).json({ message: "Invalid destination name." });
    }

    // Check if destination already exists in collection
    const existingDestination = await Destination.findOne({ slug });
    if (existingDestination) {
      return res.status(409).json({
        message: "This destination is already listed in the database.",
      });
    }

    // Call Gemini for fact-checking verdict recommendation
    let geminiVerdict = {
      verified: false,
      confidence: "low",
      notes: "Verification unavailable",
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: buildVerificationPrompt({
                      name,
                      state,
                      region,
                      bestSeason,
                      budget,
                      ecoOptions,
                    }),
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
              maxOutputTokens: 500,
            },
          }),
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const rawText =
            data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleaned = rawText.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleaned);

          if (typeof parsed.verified === "boolean") {
            geminiVerdict = {
              verified: parsed.verified,
              confidence: parsed.confidence || "medium",
              notes: parsed.notes || "Automated check complete",
            };
          }
        } else {
          console.warn(
            "Gemini verification non-200 status:",
            response.status
          );
        }
      } catch (geminiErr) {
        clearTimeout(timeout);
        console.warn(
          "Gemini verification timed out or failed:",
          geminiErr.message
        );
        geminiVerdict = {
          verified: false,
          confidence: "low",
          notes: "Gemini verification service was unavailable or timed out.",
        };
      }
    }

    const submission = await DestinationSubmission.create({
      submittedBy: req.userId,
      name,
      state,
      region,
      tagline,
      bestSeason,
      budget,
      ecoOptions: Array.isArray(ecoOptions) ? ecoOptions : [],
      image,
      lat: Number(lat),
      lng: Number(lng),
      status: "pending",
      geminiVerdict,
    });

    return res.status(201).json({
      message:
        "Thank you! Your destination suggestion has been submitted and is currently under review by our admin team.",
      submission,
    });
  } catch (err) {
    console.error("Failed to create destination submission:", err.message);
    return res.status(500).json({
      message: "Failed to submit destination",
      error: err.message,
    });
  }
};

// 2. Get logged-in user's submissions (User)
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await DestinationSubmission.find({
      submittedBy: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(submissions);
  } catch (err) {
    console.error("Failed to fetch my submissions:", err.message);
    return res.status(500).json({
      message: "Failed to fetch submissions",
      error: err.message,
    });
  }
};

// 3. Get all submissions (Admin only)
export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await DestinationSubmission.find()
      .populate("submittedBy", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(submissions);
  } catch (err) {
    console.error("Failed to fetch all submissions:", err.message);
    return res.status(500).json({
      message: "Failed to fetch all submissions",
      error: err.message,
    });
  }
};

// 4. Approve submission (Admin only)
export const approveSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await DestinationSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    if (submission.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Submission is already ${submission.status}.` });
    }

    const slug = slugify(submission.name);

    // Ensure no conflict created in Destination collection in the meantime
    const existingDest = await Destination.findOne({ slug });
    if (existingDest) {
      return res.status(409).json({
        message: "A destination with this slug already exists in the database.",
      });
    }

    // Create the Destination document
    const newDestination = await Destination.create({
      name: submission.name,
      slug,
      state: submission.state,
      region: submission.region,
      tagline: submission.tagline,
      bestSeason: submission.bestSeason,
      rating: 4.0,
      budget: submission.budget,
      image: submission.image,
      ecoOptions: submission.ecoOptions || [],
      mapX: 50,
      mapY: 50,
      lat: submission.lat,
      lng: submission.lng,
    });

    // Update submission record
    submission.status = "approved";
    submission.resultingDestinationSlug = slug;
    submission.reviewedBy = req.userId;
    submission.reviewedAt = new Date();
    await submission.save();

    // Update the submitting user's contribution profile
    await User.findByIdAndUpdate(submission.submittedBy, {
      $push: {
        contributions: {
          destinationName: submission.name,
          destinationSlug: slug,
          contributedAt: new Date(),
        },
      },
      $set: { isContributor: true },
    });

    // Notify the submitting user
    if (submission.submittedBy) {
      await createNotification({
        userId: submission.submittedBy,
        title: "Your destination was approved!",
        message: `Congratulations! "${submission.name}" has been verified and added to the official Travel In Depth destinations.`,
        type: "system",
        link: `/destinations/${slug}`,
      });
    }

    return res.status(200).json({
      message: "Destination submission approved and added to active destinations.",
      submission,
      destination: newDestination,
    });
  } catch (err) {
    console.error("Failed to approve submission:", err.message);
    return res.status(500).json({
      message: "Failed to approve submission",
      error: err.message,
    });
  }
};

// 5. Reject submission (Admin only)
export const rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await DestinationSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    if (submission.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Submission is already ${submission.status}.` });
    }

    submission.status = "rejected";
    submission.reviewedBy = req.userId;
    submission.reviewedAt = new Date();
    await submission.save();

    // Notify the submitting user
    if (submission.submittedBy) {
      await createNotification({
        userId: submission.submittedBy,
        title: "Update on your submission",
        message: `Thank you for sharing "${submission.name}". It was not approved for listing at this time.`,
        type: "system",
      });
    }

    return res.status(200).json({
      message: "Destination submission has been rejected.",
      submission,
    });
  } catch (err) {
    console.error("Failed to reject submission:", err.message);
    return res.status(500).json({
      message: "Failed to reject submission",
      error: err.message,
    });
  }
};
