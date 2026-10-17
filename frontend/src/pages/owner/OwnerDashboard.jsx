
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import api from "../../services/api";

function OwnerDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const response = await api.get("/properties/my");

        setProperties(response.data.properties || []);
      } catch (error) {
        console.error("Failed to fetch my properties:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load your properties."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

  const pendingCount = properties.filter(
    (property) => property.status === "pending"
  ).length;

  const approvedCount = properties.filter(
    (property) => property.status === "approved"
  ).length;

  const rejectedCount = properties.filter(
    (property) => property.status === "rejected"
  ).length;

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/properties/${propertyId}`);

      setProperties((current) =>
        current.filter((property) => property._id !== propertyId)
      );
    } catch (error) {
      console.error("Failed to delete property:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete property."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Owner Dashboard
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your StayEasyy listings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/owner/enquiries"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-700 px-5 py-3 font-semibold text-teal-700 transition hover:bg-teal-50"
            >
              <MessageSquare size={18} />
              View Enquiries
            </Link>

            <Link
              to="/owner/properties/new"
              className="rounded-lg bg-teal-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-teal-800"
            >
              + Add Property
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Listings</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {properties.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {rejectedCount}
            </p>
          </div>
        </div>

        {/* Properties */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-900">
            My Properties
          </h2>

          {properties.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-slate-500">
                You haven't added any properties yet.
              </p>

              <Link
                to="/owner/properties/new"
                className="mt-4 inline-block font-semibold text-teal-700 hover:underline"
              >
                Add your first property →
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {property.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {property.area
                        ? `${property.area}, `
                        : ""}
                      {property.city}
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      ₹{Number(property.rent).toLocaleString("en-IN")} / month
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/owner/properties/${property._id}/edit`}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(property._id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        property.status === "approved"
                          ? "bg-green-50 text-green-700"
                          : property.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
