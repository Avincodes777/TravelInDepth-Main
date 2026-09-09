import mediaManifest from "../mediaManifest.json";

/**
 * Inserts Cloudinary transformation parameters into a Cloudinary URL.
 * URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}
 *
 * @param {string} url - Cloudinary URL
 * @param {string} transformations - Transformation string (e.g., 'f_auto,q_auto')
 * @returns {string} Transformed Cloudinary URL
 */
function applyCloudinaryTransformations(url, transformations) {
  if (!url || !transformations || typeof url !== "string") return url;

  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const prefix = url.slice(0, uploadIndex + "/upload/".length);
  const suffix = url.slice(uploadIndex + "/upload/".length);

  // Avoid duplicate transformation segments if already present
  if (suffix.startsWith(`${transformations}/`)) {
    return url;
  }

  return `${prefix}${transformations}/${suffix}`;
}

/**
 * Normalizes a local path and retrieves its Cloudinary CDN URL from the media manifest,
 * automatically applying Cloudinary optimization parameters (f_auto, q_auto).
 *
 * @param {string} localPath - Relative local path (e.g., "videos/v1.mp4", "/videos/v1.mp4", "assets/hawamahal.jpg")
 * @param {Object} [options] - Optional custom options
 * @param {string} [options.transformations] - Custom Cloudinary transformation string
 * @param {boolean} [options.optimize=true] - Whether to apply auto optimizations (default: true)
 * @returns {string} Cloudinary secure URL with optimizations or original fallback
 */
export function getMediaUrl(localPath, options = {}) {
  if (!localPath) return "";

  const { transformations, optimize = true } = options;

  // If already an absolute URL (http/https)
  if (localPath.startsWith("http://") || localPath.startsWith("https://")) {
    if (optimize && localPath.includes("res.cloudinary.com")) {
      const isVideo = /\.(mp4|webm|mov|mkv|avi)(\?.*)?$/i.test(localPath) || localPath.includes("/video/upload/");
      const defaultTransform = isVideo ? "f_auto,q_auto" : "f_auto,q_auto";
      return applyCloudinaryTransformations(localPath, transformations || defaultTransform);
    }
    return localPath;
  }

  // Strip leading slash or ./ for manifest lookup
  const normalizedKey = localPath.replace(/^(\.\/|\/)/, "");

  if (mediaManifest && mediaManifest[normalizedKey]) {
    const rawUrl = mediaManifest[normalizedKey];

    if (!optimize) {
      return rawUrl;
    }

    const isVideo =
      normalizedKey.startsWith("videos/") ||
      /\.(mp4|webm|mov|mkv|avi)$/i.test(normalizedKey) ||
      rawUrl.includes("/video/upload/");

    const defaultTransform = isVideo ? "f_auto,q_auto" : "f_auto,q_auto";
    const appliedTransform = transformations || defaultTransform;

    return applyCloudinaryTransformations(rawUrl, appliedTransform);
  }

  console.warn(
    `[media] Path "${localPath}" (normalized: "${normalizedKey}") not found in mediaManifest.json. Falling back to local path.`
  );
  return localPath;
}

export default getMediaUrl;
