import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingProperties = async () => {
    try {
      const response = await api.get("/properties/admin/pending");

      setProperties(response.data.properties);
    } catch (error) {
      console.error("Failed to fetch pending properties:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load pending properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const updateStatus = async (propertyId, status) => {
    try {
      await api.patch(
        `/properties/admin/${propertyId}/status`,
        { status }
      );

      // Remove the property from pending list
      setProperties((currentProperties) =>
        currentProperties.filter(
          (property) => property._id !== propertyId
        )
      );
    } catch (error) {
      console.error("Failed to update property:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update property."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">
          Loading pending properties...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Review and manage property listings.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Pending Listings
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {properties.length}
          </p>
        </div>

        {/* Empty state */}
        {properties.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No pending listings
            </h2>

            <p className="mt-2 text-slate-500">
              All property listings have been reviewed.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {properties.map((property) => (
              <div
                key={property._id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 md:flex-row md:justify-between">

                  {/* Property information */}
                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-slate-900">
                        {property.title}
                      </h2>

                      <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                        Pending
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {property.area}, {property.city}
                    </p>

                    <p className="mt-4 text-lg font-bold text-slate-900">
                      ₹{property.rent.toLocaleString("en-IN")}
                      <span className="text-sm font-normal text-slate-500">
                        {" "}
                        / month
                      </span>
                    </p>

                    <p className="mt-3 text-sm text-slate-600">
                      {property.description}
                    </p>

                    {/* Owner */}
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Property Owner
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {property.owner?.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {property.owner?.email}
                      </p>

                      {property.owner?.phone && (
                        <p className="text-sm text-slate-500">
                          {property.owner.phone}
                        </p>
                      )}
                    </div>

                    {/* Amenities */}
                    {property.amenities?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {property.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-row gap-3 md:flex-col md:justify-center">

                    <button
                      onClick={() =>
                        updateStatus(
                          property._id,
                          "approved"
                        )
                      }
                      className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          property._id,
                          "rejected"
                        )
                      }
                      className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Reject
                    </button>

                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;