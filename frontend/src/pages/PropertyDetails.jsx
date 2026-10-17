
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import PropertyMap from "../components/PropertyMap";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Enquiry form state
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  // Review state
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/properties/${id}`);
        setProperty(response.data.property);
      } catch (error) {
        console.error("Failed to fetch property:", error);
        setError("Property not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Check whether the property is saved
  useEffect(() => {
    const checkSavedProperty = async () => {
      if (authLoading || !user || user.role !== "tenant") {
        setIsSaved(false);
        return;
      }

      try {
        const response = await api.get("/properties/saved");
        const savedProperties = response.data.properties || [];

        setIsSaved(
          savedProperties.some(
            (savedProperty) => savedProperty._id === id
          )
        );
      } catch (error) {
        console.error("Failed to check saved property:", error);
      }
    };

    checkSavedProperty();
  }, [id, user, authLoading]);

  // Fetch reviews for this property
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError("");

        const response = await api.get(`/reviews/${id}`);

        setReviews(response.data.reviews || []);
        setAverageRating(response.data.averageRating || 0);
        setTotalReviews(response.data.totalReviews || 0);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setReviewsError("Unable to load reviews. Please try again later.");
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Save or remove a property from favorites
  const handleSaveProperty = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "tenant") {
      setError("Only tenants can save properties.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (isSaved) {
        await api.delete(`/properties/${id}/save`);
        setIsSaved(false);
        setMessage("Property removed from saved properties.");
      } else {
        await api.post(`/properties/${id}/save`);
        setIsSaved(true);
        setMessage("Property saved successfully.");
      }
    } catch (error) {
      console.error("Failed to update saved property:", error);

      setError(
        error.response?.data?.message ||
          "Unable to update saved property."
      );
    } finally {
      setSaving(false);
    }
  };

  // Submit an enquiry to the property owner
  const handleSubmitEnquiry = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "tenant") {
      setError("Only tenants can enquire about properties.");
      return;
    }

    const trimmedMessage = enquiryMessage.trim();

    if (trimmedMessage.length < 10 || trimmedMessage.length > 1000) {
      setError("Your message must be between 10 and 1000 characters.");
      return;
    }

    try {
      setEnquiryLoading(true);
      setError("");
      setMessage("");

      await api.post("/enquiries", {
        propertyId: id,
        message: trimmedMessage,
      });

      setEnquiryMessage("");
      setMessage("Your enquiry has been sent successfully!");
    } catch (error) {
      console.error("Failed to submit enquiry:", error);

      setError(
        error.response?.data?.message ||
          "Unable to send your enquiry. Please try again."
      );
    } finally {
      setEnquiryLoading(false);
    }
  };


  // Start or open a chat with the property owner
  const [chatLoading, setChatLoading] = useState(false);

  const handleMessageOwner = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "tenant") {
      setError("Only tenants can message property owners.");
      return;
    }

    try {
      setChatLoading(true);
      setError("");

      const response = await api.post("/chat/conversations", {
        propertyId: id,
      });

      const conversationId = response.data.conversation?._id;

      if (!conversationId) {
        throw new Error("Conversation ID was not returned.");
      }

      navigate("/chat");
    } catch (error) {
      console.error("Failed to start chat:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start a conversation."
      );
    } finally {
      setChatLoading(false);
    }
  };


  
const handleSubmitReview = async (event) => {
  event.preventDefault();

  if (!user) {
    navigate("/login");
    return;
  }

  if (user.role !== "tenant") {
    setReviewMessage("Only tenants can submit reviews.");
    return;
  }

  const trimmedComment = reviewComment.trim();

  if (trimmedComment.length < 10 || trimmedComment.length > 1000) {
    setReviewMessage("Your review must be between 10 and 1000 characters.");
    return;
  }

  try {
    setReviewSubmitting(true);
    setReviewMessage("");

    await api.post("/reviews", {
      propertyId: id,
      rating: reviewRating,
      comment: trimmedComment,
    });

    setReviewComment("");
    setReviewRating(5);
    setReviewMessage("Your review was submitted successfully!");

    // Refresh the displayed reviews and average rating
    const response = await api.get(`/reviews/${id}`);

    setReviews(response.data.reviews || []);
    setAverageRating(response.data.averageRating || 0);
    setTotalReviews(response.data.totalReviews || 0);
  } catch (error) {
    console.error("Failed to submit review:", error);

    setReviewMessage(
      error.response?.data?.message ||
        "Unable to submit your review. Please try again."
    );
  } finally {
    setReviewSubmitting(false);
  }
};


  // Loading state
  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading property...</p>
      </div>
    );
  }

  // Property loading error
  if (!property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-red-600">
          {error || "Property not found."}
        </p>

        <Link
          to="/properties"
          className="mt-4 text-teal-700 hover:underline"
        >
          ← Back to properties
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Back navigation */}
        <Link
          to="/properties"
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          ← Back to properties
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Property image */}
          {property.images?.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-72 w-full object-cover md:h-96"
            />
          ) : (
            <div className="flex h-72 items-center justify-center bg-slate-200 md:h-96">
              <span className="text-slate-500">
                No image available
              </span>
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Title and rent */}
            <div className="flex flex-col justify-between gap-6 md:flex-row">
              <div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                  {property.type}
                </span>

                <h1 className="mt-3 text-3xl font-bold text-slate-900">
                  {property.title}
                </h1>

                <p className="mt-2 text-slate-500">
                  {property.area ? `${property.area}, ` : ""}
                  {property.city}
                </p>
              </div>

              <div>
                <p className="text-3xl font-bold text-slate-900">
                  ₹{Number(property.rent).toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-slate-500">per month</p>
              </div>
            </div>

            {/* Save property */}
            {user?.role === "tenant" && (
              <button
                type="button"
                onClick={handleSaveProperty}
                disabled={saving}
                className={`mt-6 flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold transition ${
                  isSaved
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="text-xl">
                  {isSaved ? "♥" : "♡"}
                </span>
                {saving
                  ? "Updating..."
                  : isSaved
                  ? "Saved"
                  : "Save Property"}
              </button>
            )}

            
{/* Message Owner */}
{user?.role === "tenant" && (
  <button
    type="button"
    onClick={handleMessageOwner}
    disabled={chatLoading}
    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
  >
    {chatLoading ? "Opening chat..." : "Message Owner"}
  </button>
)}


            {/* Success message */}
            {message && (
              <div
                role="status"
                className="mt-4 rounded-xl bg-green-50 p-4 text-green-700"
              >
                {message}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-4 text-red-700"
              >
                {error}
              </div>
            )}

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">
                About this place
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {property.description}
              </p>
            </div>

            {/* Address and deposit */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Address</p>
                <p className="mt-1 font-medium text-slate-900">
                  {property.address}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Security deposit
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  ₹
                  {Number(
                    property.securityDeposit || 0
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Property map */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Location
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Find this property on the map.
              </p>
              <div className="mt-4">
                <PropertyMap
                  latitude={property.location?.latitude}
                  longitude={property.location?.longitude}
                  title={property.title}
                />
              </div>
            </div>

            {/* Availability */}
            {property.availableFrom && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Available from
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {new Date(
                    property.availableFrom
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900">
                  Amenities
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {property.amenities.map((amenity, index) => (
                    <span
                      key={`${amenity}-${index}`}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Owner information */}
            <div className="mt-8 rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Listed by</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {property.owner?.name || "Property owner"}
              </p>

              {property.owner?.email && (
                <p className="mt-1 text-sm text-slate-500">
                  {property.owner.email}
                </p>
              )}

              {property.owner?.phone && (
                <p className="mt-1 text-sm text-slate-500">
                  {property.owner.phone}
                </p>
              )}
            </div>

            {/* Property Reviews */}
            <section className="mt-10 border-t border-slate-200 pt-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Property Reviews
              </h2>

              {reviewsLoading ? (
                <p className="mt-4 text-slate-500">
                  Loading reviews...
                </p>
              ) : reviewsError ? (
                <p role="alert" className="mt-4 text-red-600">
                  {reviewsError}
                </p>
              ) : (
                <>
                  {/* Average rating */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="text-3xl font-bold text-slate-900">
                      {averageRating.toFixed(1)}
                    </span>

                    <div>
                      <p
                        className="text-xl tracking-wide text-amber-500"
                        aria-label={`${averageRating} out of 5 stars`}
                      >
                        {"★".repeat(Math.round(averageRating))}
                        {"☆".repeat(
                          5 - Math.round(averageRating)
                        )}
                      </p>

                      <p className="text-sm text-slate-500">
                        Based on {totalReviews}{" "}
                        {totalReviews === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>
                       
                        
{/* Submit a review */}
{user?.role === "tenant" && (
  <form
    onSubmit={handleSubmitReview}
    className="mt-6 rounded-xl border border-slate-200 p-5"
  >
    <h3 className="text-lg font-semibold text-slate-900">
      Write a Review
    </h3>

    <label
      className="mt-4 block text-sm font-medium text-slate-700"
    >
      Your rating
    </label>

    <div className="mt-2 flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setReviewRating(star)}
          aria-label={`Rate ${star} out of 5 stars`}
          aria-pressed={reviewRating === star}
          className={`text-3xl ${
            star <= reviewRating
              ? "text-amber-500"
              : "text-slate-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>

    <label
      htmlFor="reviewComment"
      className="mt-4 block text-sm font-medium text-slate-700"
    >
      Your review
    </label>

    <textarea
      id="reviewComment"
      value={reviewComment}
      onChange={(event) => setReviewComment(event.target.value)}
      placeholder="Share your thoughts about this property..."
      minLength={10}
      maxLength={1000}
      rows={4}
      required
      className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
    />

    <p className="mt-1 text-right text-xs text-slate-400">
      {reviewComment.length}/1000 characters
    </p>

    {reviewMessage && (
      <p
        role="status"
        className="mt-3 text-sm text-slate-700"
      >
        {reviewMessage}
      </p>
    )}

    <button
      type="submit"
      disabled={
        reviewSubmitting ||
        reviewComment.trim().length < 10 ||
        reviewComment.trim().length > 1000
      }
      className="mt-4 w-full rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {reviewSubmitting ? "Submitting..." : "Submit Review"}
    </button>
  </form>
)}



                        
                  {/* Review list */}
                  {reviews.length === 0 ? (
                    <div className="mt-5 rounded-xl bg-slate-50 p-5">
                      <p className="font-medium text-slate-800">
                        No reviews yet
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Reviews will appear here when tenants submit them.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4">
                      {reviews.map((review) => (
                        <article
                          key={review._id}
                          className="rounded-xl border border-slate-200 bg-white p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-semibold text-slate-900">
                              {review.tenant?.name || "Tenant"}
                            </p>

                            <span
                              className="text-lg tracking-wide text-amber-500"
                              aria-label={`${review.rating} out of 5 stars`}
                            >
                              {"★".repeat(review.rating)}
                              {"☆".repeat(5 - review.rating)}
                            </span>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap leading-6 text-slate-600">
                            {review.comment}
                          </p>

                          {review.createdAt && (
                            <p className="mt-3 text-xs text-slate-400">
                              {new Date(
                                review.createdAt
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Enquiry form */}
            {user?.role === "tenant" && (
              <form
                onSubmit={handleSubmitEnquiry}
                className="mt-8 rounded-2xl border border-slate-200 p-5 sm:p-6"
              >
                <h2 className="text-xl font-bold text-slate-900">
                  Enquire About This Property
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Interested in this property? Send a message to the owner.
                </p>

                <label
                  htmlFor="enquiryMessage"
                  className="mt-5 block text-sm font-medium text-slate-700"
                >
                  Your message
                </label>

                <textarea
                  id="enquiryMessage"
                  value={enquiryMessage}
                  onChange={(event) =>
                    setEnquiryMessage(event.target.value)
                  }
                  placeholder="Hi, I'm interested in this property. Is it available?"
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {enquiryMessage.length}/1000 characters
                </p>

                <button
                  type="submit"
                  disabled={
                    enquiryLoading ||
                    enquiryMessage.trim().length < 10 ||
                    enquiryMessage.trim().length > 1000
                  }
                  className="mt-4 w-full rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enquiryLoading ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
            )}

            {!user && (
              <div className="mt-8 rounded-2xl border border-slate-200 p-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Interested in this property?
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Log in as a tenant to send an enquiry to the owner.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-4 w-full rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
                >
                  Log in to Enquire
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
