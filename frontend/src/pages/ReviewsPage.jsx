import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Star,
  MessageSquare,
  Filter,
  Sparkles,
  RefreshCw,
  CheckCircle,
  ThumbsUp,
  MapPin,
  Compass,
  Search,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { getReviews, createReview, deleteReview } from "../api/reviewApi";
import { useAuth } from "../features/auth/useAuth";
import AddReviewCard from "../components/reviews/AddReviewCard";
import ReviewModal from "../components/reviews/ReviewModal";
import ReviewSuccessToast from "../components/reviews/ReviewSuccessToast";

const CATEGORIES = ["All", "Location", "Website", "Issue/Bug", "General"];

const categoryBadges = {
  Location: { bg: "bg-orange-100 text-orange-800 border-orange-200", icon: "📍" },
  Website: { bg: "bg-blue-100 text-blue-800 border-blue-200", icon: "💻" },
  "Issue/Bug": { bg: "bg-rose-100 text-rose-800 border-rose-200", icon: "🐛" },
  General: { bg: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "✨" },
};

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Notification States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Deletion modal state
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch reviews from backend
  const fetchReviewsList = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedRating !== "All") params.rating = selectedRating;
      if (sortBy) params.sort = sortBy;

      const res = await getReviews(params);
      if (res && res.success) {
        setReviews(res.data || []);
      } else {
        setReviews(res?.data || []);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setError("Unable to load reviews from server. Displaying cached insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsList();
  }, [selectedCategory, selectedRating, sortBy]);

  // Handle Review Submission
  const handleReviewSubmit = async (formData) => {
    const res = await createReview(formData);

    // Trigger celebratory toast
    const reviewerName = res?.data?.name || user?.name || "Explorer";
    setToastMessage(`🎉 Thank you, ${reviewerName}! Your review has been published.`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 6000);

    // Refresh list to instantly reflect the new review
    await fetchReviewsList();
    return res;
  };

  // Handle Review Deletion
  const confirmDeleteReview = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await deleteReview(deletingId);

      // Optimistically remove from state
      setReviews((prev) => prev.filter((r) => r._id !== deletingId));

      setToastMessage("🗑️ Review was successfully removed.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete review:", err);
      alert(err.message || "Failed to delete review. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter reviews by client-side search query if user searches text
  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.name?.toLowerCase().includes(query) ||
      r.comment?.toLowerCase().includes(query) ||
      r.category?.toLowerCase().includes(query)
    );
  });

  // Calculate Rating Statistics
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0) /
          totalReviews
        ).toFixed(1)
      : "5.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Number(r.rating) === stars).length,
    percentage:
      totalReviews > 0
        ? Math.round(
            (reviews.filter((r) => Number(r.rating) === stars).length /
              totalReviews) *
              100
          )
        : 0,
  }));

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2D1B00] pt-28 pb-20 px-4 sm:px-6 lg:px-12 font-sans">
      <Helmet>
        <title>Travel Reviews & Community Ratings | Travel In Depth</title>
        <meta
          name="description"
          content="Read authentic traveler reviews and ratings for Indian destinations, places, and website experience. Share your own journey with Travel In Depth."
        />
        <link rel="canonical" href="https://travelindepth.com/reviews" />
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B1A1A]/10 border border-[#8B1A1A]/20 text-[#8B1A1A] text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles size={14} className="text-[#FF6B1A]" />
            Traveler Voices & Ratings
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#8B1A1A] tracking-tight leading-tight">
            Real Stories from <span className="text-[#FF6B1A]">Authentic Explorers</span>
          </h1>
          <p className="text-stone-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Discover unfiltered feedback, tips, and experiences shared by our vibrant travel community across India.
          </p>
        </div>

        {/* Prominent "Add Review" Card */}
        <AddReviewCard onOpenModal={() => setIsModalOpen(true)} />

        {/* Rating Breakdown & Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Score Card */}
          <div className="bg-white rounded-3xl p-7 border border-[#E8DCC4] shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Overall Traveler Score
            </span>
            <div className="text-5xl sm:text-6xl font-serif font-black text-[#8B1A1A] tracking-tight">
              {averageRating}
            </div>
            <div className="flex items-center gap-1 text-[#F5A623] my-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  className={
                    s <= Math.round(Number(averageRating))
                      ? "fill-current"
                      : "text-stone-300"
                  }
                />
              ))}
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Based on{" "}
              <span className="font-bold text-[#8B1A1A]">
                {totalReviews} verified community ratings
              </span>
            </p>
          </div>

          {/* Star Distribution Progress */}
          <div className="bg-white rounded-3xl p-7 border border-[#E8DCC4] shadow-sm lg:col-span-2 flex flex-col justify-center space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B1A1A]">
                Rating Distribution
              </h4>
              <span className="text-xs text-stone-500">Live Breakdown</span>
            </div>
            {ratingCounts.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-stone-700 flex items-center gap-1">
                  {item.stars}{" "}
                  <Star size={12} className="text-[#F5A623] fill-current" />
                </span>
                <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B1A] to-[#F5A623] rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right font-medium text-stone-500">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter & Control Bar */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8DCC4] shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mr-2 shrink-0">
                Filter:
              </span>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all shrink-0 ${
                      isActive
                        ? "bg-[#8B1A1A] text-white shadow-md shadow-red-950/20"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {cat === "All" ? "✨ All Categories" : cat}
                  </button>
                );
              })}
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="text"
                  placeholder="Search reviews or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#FFFDF9] border border-[#E8DCC4] text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#FF6B1A]"
                />
              </div>

              {/* Star Filter */}
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-3.5 py-2 rounded-2xl bg-[#FFFDF9] border border-[#E8DCC4] text-xs font-semibold text-stone-700 focus:outline-none focus:border-[#FF6B1A] cursor-pointer"
              >
                <option value="All">All Ratings</option>
                <option value="5">5 Stars Only</option>
                <option value="4">4 Stars Only</option>
                <option value="3">3 Stars Only</option>
                <option value="2">2 Stars Only</option>
                <option value="1">1 Star Only</option>
              </select>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2 rounded-2xl bg-[#FFFDF9] border border-[#E8DCC4] text-xs font-semibold text-stone-700 focus:outline-none focus:border-[#FF6B1A] cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="oldest">Oldest First</option>
              </select>

              {/* Refresh button */}
              <button
                onClick={fetchReviewsList}
                title="Refresh reviews"
                disabled={loading}
                className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Reviews Grid */}
        <div>
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 border-3 border-[#FF6B1A]/20 border-t-[#FF6B1A] rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-stone-500">
                Loading authentic traveler reviews...
              </p>
            </div>
          ) : error && reviews.length === 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-700 max-w-lg mx-auto">
              <p className="font-semibold text-sm">{error}</p>
              <button
                onClick={fetchReviewsList}
                className="mt-4 px-5 py-2 bg-[#8B1A1A] text-white rounded-full text-xs font-bold uppercase tracking-wider"
              >
                Retry
              </button>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E8DCC4] text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF2E8] border border-[#FF6B1A]/30 flex items-center justify-center mx-auto text-[#FF6B1A]">
                <MessageSquare size={28} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#8B1A1A]">
                No Reviews Found
              </h3>
              <p className="text-stone-500 text-sm">
                {searchQuery ||
                selectedCategory !== "All" ||
                selectedRating !== "All"
                  ? "No reviews match your selected filters. Try adjusting your search."
                  : "Be the very first explorer to share your feedback and experience!"}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#F5A623] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
              >
                Write the First Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map((review) => {
                const categoryStyle = categoryBadges[review.category] || {
                  bg: "bg-stone-100 text-stone-800 border-stone-200",
                  icon: "✨",
                };

                const formattedDate = review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Recently";

                return (
                  <div
                    key={review._id || Math.random()}
                    className="bg-white rounded-3xl p-7 border border-[#E8DCC4] shadow-sm hover:shadow-xl hover:border-[#FF6B1A]/30 transition-all duration-300 flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Top Meta: Category & Rating & Delete Action */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${categoryStyle.bg}`}
                        >
                          <span>{categoryStyle.icon}</span>
                          <span>{review.category}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 text-[#F5A623]">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                size={14}
                                className={
                                  idx < (review.rating || 5)
                                    ? "fill-current"
                                    : "text-stone-200"
                                }
                              />
                            ))}
                          </div>

                          {/* Delete Review Button */}
                          <button
                            onClick={() => setDeletingId(review._id)}
                            title="Delete this review"
                            className="text-stone-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line mb-6 font-normal">
                        "{review.comment}"
                      </p>
                    </div>

                    {/* Reviewer Info */}
                    <div className="pt-4 border-t border-[#F0E4D4] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B1A1A] to-[#FF6B1A] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {review.name?.charAt(0)?.toUpperCase() || "T"}
                        </div>
                        <div>
                          <h5 className="font-bold text-[#8B1A1A] group-hover:text-[#FF6B1A] transition-colors">
                            {review.name}
                          </h5>
                          <span className="text-[11px] text-stone-400">
                            Verified Explorer
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] text-stone-400">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal Dialog */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleReviewSubmit}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => !isDeleting && setDeletingId(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 z-10 space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Delete Review?
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Are you sure you want to permanently delete this review? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="px-5 py-2 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteReview}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      <ReviewSuccessToast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
