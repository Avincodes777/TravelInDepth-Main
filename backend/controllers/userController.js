import User from "../models/User.js";
import Notification from "../models/Notification.js";

/**
 * GET /api/users/profile
 * Fetch authenticated user profile details
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
      error: error.message,
    });
  }
};

/**
 * PUT /api/users/profile
 * Update profile information (name, bio, location, avatar, phone)
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, location, avatar, phone } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (location !== undefined) updates.location = location.trim();
    if (avatar !== undefined) updates.avatar = avatar.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

/**
 * PUT /api/users/settings
 * Update preferences and settings
 */
export const updateUserSettings = async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, darkMode, currency } = req.body;

    const updates = {};
    if (emailNotifications !== undefined) updates["settings.emailNotifications"] = Boolean(emailNotifications);
    if (pushNotifications !== undefined) updates["settings.pushNotifications"] = Boolean(pushNotifications);
    if (darkMode !== undefined) updates["settings.darkMode"] = Boolean(darkMode);
    if (currency !== undefined) updates["settings.currency"] = String(currency);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully!",
      data: user.settings,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update settings.",
      error: error.message,
    });
  }
};

/**
 * GET /api/notifications
 * Fetch all notifications for the authenticated user (seeds default welcoming ones if empty)
 */
export const getNotifications = async (req, res) => {
  try {
    let notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    // If new user with 0 notifications, seed helpful welcome notifications
    if (notifications.length === 0) {
      const defaultNotifs = [
        {
          user: req.userId,
          title: "Welcome to Travel In Depth! 🌟",
          message: "Your journey starts here. Explore curated Indian destinations and AI itineraries.",
          type: "system",
          isRead: false,
        },
        {
          user: req.userId,
          title: "Sustainability Badge Unlocked 🌱",
          message: "Check out your Eco Explorer Score and pledge for mindful travel in India.",
          type: "alert",
          isRead: false,
        },
      ];

      await Notification.insertMany(defaultNotifs);
      notifications = await Notification.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .lean();
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === "all") {
      await Notification.updateMany({ user: req.userId }, { $set: { isRead: true } });
      return res.status(200).json({
        success: true,
        message: "All notifications marked as read.",
      });
    }

    const notif = await Notification.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notif,
    });
  } catch (error) {
    console.error("Error marking notification read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification or all notifications
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === "all") {
      await Notification.deleteMany({ user: req.userId });
      return res.status(200).json({
        success: true,
        message: "All notifications cleared.",
      });
    }

    const notif = await Notification.findOneAndDelete({ _id: id, user: req.userId });
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Notification removed.",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
      error: error.message,
    });
  }
};
