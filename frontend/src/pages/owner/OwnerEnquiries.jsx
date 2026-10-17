
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, RefreshCw } from "lucide-react";
import api from "../../services/api";

function OwnerEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/enquiries/received");
      setEnquiries(response.data.enquiries || []);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      setError("");

      await api.patch(`/enquiries/${id}/status`, { status });

      setEnquiries((current) =>
        current.map((enquiry) =>
          enquiry._id === id
            ? { ...enquiry, status }
            : enquiry
        )
      );
    } catch (err) {
      console.error("Failed to update enquiry:", err);
      setError(
        err.response?.data?.message ||
          "Unable to update enquiry status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const filters = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Contacted", value: "contacted" },
    { label: "Closed", value: "closed" },
  ];

  const filteredEnquiries =
    activeFilter === "all"
      ? enquiries
      : enquiries.filter(
          (enquiry) => enquiry.status === activeFilter
        );

  const getFilterCount = (filterValue) =>
    filterValue === "all"
      ? enquiries.length
      : enquiries.filter(
          (enquiry) => enquiry.status === filterValue
        ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading enquiries...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Tenant Enquiries
            </h1>
            <p className="mt-2 text-slate-500">
              Manage messages about your properties.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchEnquiries}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Total enquiries */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">
            Total enquiries
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {enquiries.length}
          </p>
        </div>

        {/* Status filters */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Filter by status
          </h2>

          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={activeFilter === filter.value}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter.value
                    ? "bg-teal-700 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {filter.label} ({getFilterCount(filter.value)})
              </button>
            ))}
          </div>
        </div>

        {/* Enquiry list or empty state */}
        {filteredEnquiries.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <MessageSquare
              size={36}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              {enquiries.length === 0
                ? "No enquiries yet"
                : `No ${activeFilter} enquiries`}
            </h2>

            <p className="mt-2 text-slate-500">
              {enquiries.length === 0
                ? "Tenant enquiries about your properties will appear here."
                : "Try selecting another status filter to see more enquiries."}
            </p>

            {activeFilter !== "all" && enquiries.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className="mt-4 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                View All Enquiries
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {filteredEnquiries.map((enquiry) => (
              <article
                key={enquiry._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                {/* Property information and status */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {enquiry.property?.title ||
                        "Property unavailable"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {enquiry.property?.area
                        ? `${enquiry.property.area}, `
                        : ""}
                      {enquiry.property?.city || ""}
                    </p>

                    {enquiry.property?.rent != null && (
                      <p className="mt-2 font-semibold text-teal-700">
                        ₹
                        {Number(
                          enquiry.property.rent
                        ).toLocaleString("en-IN")}
                        /month
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      enquiry.status === "contacted"
                        ? "bg-blue-100 text-blue-700"
                        : enquiry.status === "closed"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {enquiry.status}
                  </span>
                </div>

                {/* Tenant information and message */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="font-semibold text-slate-900">
                    {enquiry.tenant?.name || "Tenant"}
                  </p>

                  {enquiry.tenant?.email && (
                    <p className="mt-1 text-sm text-slate-600">
                      {enquiry.tenant.email}
                    </p>
                  )}

                  {enquiry.tenant?.phone && (
                    <p className="mt-1 text-sm text-slate-600">
                      {enquiry.tenant.phone}
                    </p>
                  )}

                  <p className="mt-4 whitespace-pre-wrap text-slate-700">
                    {enquiry.message}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    Received {formatDate(enquiry.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-3">
                  {enquiry.property?._id && (
                    <Link
                      to={`/properties/${enquiry.property._id}`}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Property
                    </Link>
                  )}

                  {enquiry.status === "pending" && (
                    <button
                      type="button"
                      disabled={updatingId === enquiry._id}
                      onClick={() =>
                        updateStatus(enquiry._id, "contacted")
                      }
                      className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                      {updatingId === enquiry._id
                        ? "Updating..."
                        : "Mark Contacted"}
                    </button>
                  )}

                  {enquiry.status !== "closed" && (
                    <button
                      type="button"
                      disabled={updatingId === enquiry._id}
                      onClick={() =>
                        updateStatus(enquiry._id, "closed")
                      }
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {updatingId === enquiry._id
                        ? "Updating..."
                        : "Close Enquiry"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerEnquiries;
