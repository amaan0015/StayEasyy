import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();

  const location = searchParams.get("location") || "";
  const type = searchParams.get("type") || "";
  const maxRent = searchParams.get("maxRent") || "";
  const sort = searchParams.get("sort") || "";

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Local filter values
  const [locationInput, setLocationInput] = useState(location);
  const [typeInput, setTypeInput] = useState(type);
  const [maxRentInput, setMaxRentInput] = useState(maxRent);
  const [sortInput, setSortInput] = useState(sort);

  useEffect(() => {
    setLocationInput(location);
    setTypeInput(type);
    setMaxRentInput(maxRent);
    setSortInput(sort);
  }, [location, type, maxRent, sort]);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (location) {
          params.set("location", location);
        }

        if (type) {
          params.set("type", type);
        }

        if (maxRent) {
          params.set("maxRent", maxRent);
        }

        if (sort) {
          params.set("sort", sort);
        }

        const response = await api.get(
          `/properties?${params.toString()}`
        );

        setProperties(response.data.properties || []);
      } catch (error) {
        console.error("Failed to fetch properties:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load properties."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [location, type, maxRent, sort]);

  const handleSearch = (e) => {
    e.preventDefault();

    const params = {};

    if (locationInput.trim()) {
      params.location = locationInput.trim();
    }

    if (typeInput) {
      params.type = typeInput;
    }

    if (maxRentInput) {
      params.maxRent = maxRentInput;
    }

    if (sortInput) {
      params.sort = sortInput;
    }

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setLocationInput("");
    setTypeInput("");
    setMaxRentInput("");
    setSortInput("");

    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">
          Loading properties...
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
            Explore Properties
          </h1>

          <p className="mt-2 text-slate-500">
            Find a place that fits your life.
          </p>
        </div>

        {/* Filter Bar */}
        <form
          onSubmit={handleSearch}
          className="mb-8 rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>

              <input
                type="text"
                value={locationInput}
                onChange={(e) =>
                  setLocationInput(e.target.value)
                }
                placeholder="City or area"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-600"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Property Type
              </label>

              <select
                value={typeInput}
                onChange={(e) =>
                  setTypeInput(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-teal-600"
              >
                <option value="">All types</option>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Room">Room</option>
                <option value="Flat">Flat</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
              </select>
            </div>

            {/* Maximum Rent */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Maximum Rent
              </label>

              <input
                type="number"
                value={maxRentInput}
                onChange={(e) =>
                  setMaxRentInput(e.target.value)
                }
                placeholder="₹10,000"
                min="0"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-600"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sort By
              </label>

              <select
                value={sortInput}
                onChange={(e) =>
                  setSortInput(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-teal-600"
              >
                <option value="">Newest</option>
                <option value="rent_asc">
                  Rent: Low to High
                </option>
                <option value="rent_desc">
                  Rent: High to Low
                </option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        </form>

        {/* Active Filters */}
        {(location || type || maxRent) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">

            <span className="text-sm font-medium text-slate-600">
              Filters:
            </span>

            {location && (
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
                📍 {location}
              </span>
            )}

            {type && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {type}
              </span>
            )}

            {maxRent && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                Under ₹
                {Number(maxRent).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <p className="mb-4 text-sm text-slate-500">
          {properties.length}{" "}
          {properties.length === 1
            ? "property"
            : "properties"}{" "}
          found
        </p>

        {/* Results */}
        {properties.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">🏠</div>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No properties found
            </h2>

            <p className="mt-2 text-slate-500">
              Try changing your location, property type,
              or budget.
            </p>

            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-5 rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white hover:bg-teal-800"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {properties.map((property) => (
              <Link
                key={property._id}
                to={`/properties/${property._id}`}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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

                {/* Information */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {property.title}
                    </h2>

                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                      {property.type}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {property.area
                      ? `${property.area}, `
                      : ""}
                    {property.city}
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

                </div>
              </Link>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}

export default Properties;