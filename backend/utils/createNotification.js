import Notification from "../models/Notification.js";

/**
 * Creates a notification for a user with built-in fault tolerance.
 * Wrapped in its own try/catch to ensure failed notification writes
 * never crash or block parent transactions or operations.
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.userId - Target user's ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification descriptive message
 * @param {string} [params.type="system"] - Notification type ("alert" | "booking" | "review" | "system")
 * @param {string} [params.link=""] - Optional destination URL or internal route
 * @returns {Promise<Object|null>} - Created notification document, or null if creation failed
 */
export const createNotification = async ({
  userId,
  title,
  message,
  type = "system",
  link = "",
}) => {
  try {
    if (!userId || !title || !message) {
      console.warn("⚠️ [NotificationHelper] Missing required fields for notification creation.", {
        userId,
        title,
        message,
      });
      return null;
    }

    const notification = await Notification.create({
      user: userId,
      title: title.trim(),
      message: message.trim(),
      type: ["alert", "booking", "review", "system"].includes(type) ? type : "system",
      link: link || "",
      isRead: false,
    });

    return notification;
  } catch (err) {
    // Log failure without throwing so parent operations are never blocked
    console.error("❌ [NotificationHelper] Failed to create notification:", err.message);
    return null;
  }
};

export default createNotification;
