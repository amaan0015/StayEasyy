import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function SavedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        const response = await api.get("/properties/saved");

        setProperties(response.data.properties || []);
      } catch (error) {
        console.error("Failed to fetch saved properties:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load saved properties."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
  }, []);

  const handleRemove = async (propertyId) => {
    try {
      await api.delete(`/properties/${propertyId}/save`);

      setProperties((current) =>
        current.filter(
          (property) => property._id !== propertyId
        )
      );
    } catch (error) {
      console.error("Failed to remove saved property:", error);

      setError(
        error.response?.data?.message ||
          "Unable to remove property."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">
          Loading saved properties...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Saved Properties
          </h1>

          <p className="mt-2 text-slate-500">
            Places you've saved for later.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* No properties */}
        {properties.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">♡</div>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No saved properties yet
            </h2>

            <p className="mt-2 text-slate-500">
              Save properties you like and find them here later.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-block rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-slate-500">
              {properties.length}{" "}
              {properties.length === 1
                ? "property"
                : "properties"}{" "}
              saved
            </p>

            {/* Property cards */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  {/* Image */}
                  {property.images?.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-200">
                      <span className="text-slate-500">
                        No image
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {property.title}
                      </h2>

                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                        {property.type}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {property.area}, {property.city}
                    </p>

                    <p className="mt-4 text-xl font-bold text-slate-900">
                      ₹
                      {Number(property.rent).toLocaleString(
                        "en-IN"
                      )}
                      <span className="text-sm font-normal text-slate-500">
                        {" "}
                        / month
                      </span>
                    </p>

                    {property.owner?.name && (
                      <p className="mt-3 text-sm text-slate-500">
                        Listed by {property.owner.name}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <Link
                        to={`/properties/${property._id}`}
                        className="flex-1 rounded-lg bg-teal-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-800"
                      >
                        View Property
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(property._id)
                        }
                        className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SavedProperties;