import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads an in-memory buffer directly to Cloudinary via stream.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Cloudinary upload options (e.g., folder, transformation)
 * @returns {Promise<Object>} Resolves with Cloudinary result ({ secure_url, public_id, ... })
 */
export const uploadStream = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: "travel_journal",
      resource_type: "auto",
      quality: "auto:good",
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Deletes an asset from Cloudinary by public ID.
 * @param {string} publicId
 * @returns {Promise<Object>}
 */
export const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
