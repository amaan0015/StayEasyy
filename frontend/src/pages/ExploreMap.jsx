
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import api from "../services/api";

function ExploreMap() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [radius, setRadius] = useState(10);

  // Step 1: Detect the user's location once.
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (geoError) => {
        console.error("Location error:", geoError);
        setError(
          "Location permission is required to find nearby properties."
        );
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Step 2: Fetch properties whenever location or radius changes.
  useEffect(() => {
    if (!userLocation) return;

    let cancelled = false;

    async function fetchNearbyProperties() {
      setLoading(true);
      setError("");

      try {
        const { latitude, longitude } = userLocation;

        const response = await api.get(
          `/properties/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=${radius}`
        );

        if (!cancelled) {
          setProperties(response.data.properties || []);
        }
      } catch (err) {
        console.error("Failed to fetch nearby properties:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load nearby properties."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNearbyProperties();

    return () => {
      cancelled = true;
    };
  }, [userLocation, radius]);

  const propertiesWithLocation = properties.filter(
    (property) => {
      const lat = Number(property.location?.latitude);
      const lng = Number(property.location?.longitude);

      return (
        property.location?.latitude !== undefined &&
        property.location?.longitude !== undefined &&
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    }
  );

  // Loading
  if (loading || locationLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl">📍</div>
          <p className="mt-4 text-lg font-semibold text-slate-900">
            Finding properties near you...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Please wait while we load nearby properties.
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">📍</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Unable to load nearby properties
        </h1>
        <p className="mt-2 max-w-md text-slate-500">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No properties within the selected radius
  if (propertiesWithLocation.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">🏠</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          No properties nearby
        </h1>
        <p className="mt-2 max-w-md text-slate-500">
          We couldn't find any properties within {radius} km
          of your current location.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[5, 10, 25].map((value) => (
            <button
              key={value}
              onClick={() => setRadius(value)}
              className={`rounded-xl border px-4 py-2 font-medium ${
                radius === value
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {value} km
            </button>
          ))}
        </div>

        <Link
          to="/properties"
          className="mt-4 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
        >
          Explore All Properties
        </Link>
      </div>
    );
  }

  const center = [
    Number(userLocation.latitude),
    Number(userLocation.longitude),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Explore Nearby
          </h1>
          <p className="mt-2 text-slate-500">
            Find properties within {radius} km of your location.
          </p>
        </div>

        {/* Location and radius controls */}
        <div className="mb-6 rounded-xl border border-teal-100 bg-teal-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-white">
                📍
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Your location
                </p>
                <p className="text-sm text-slate-500">
                  Searching within {radius} km
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="radius"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search radius
              </label>

              <select
                id="radius"
                value={radius}
                onChange={(event) =>
                  setRadius(Number(event.target.value))
                }
                className="w-full rounded-lg border border-teal-200 bg-white px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 sm:w-auto"
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            className="h-[600px] w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location marker */}
            <Marker position={center}>
              <Popup>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    You are here
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your current location
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Property markers */}
            {propertiesWithLocation.map((property) => {
              const position = [
                Number(property.location.latitude),
                Number(property.location.longitude),
              ];

              return (
                <Marker
                  key={property._id}
                  position={position}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h2 className="font-semibold text-slate-900">
                        {property.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {property.type}
                      </p>

                      <p className="mt-2 font-semibold text-slate-900">
                        ₹{Number(property.rent).toLocaleString("en-IN")}
                        /month
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {property.area ? `${property.area}, ` : ""}
                        {property.city}
                      </p>

                      {property.distance !== undefined && (
                        <p className="mt-2 text-sm font-medium text-teal-700">
                          📍 {property.distance} km away
                        </p>
                      )}

                      <Link
                        to={`/properties/${property._id}`}
                        className="mt-3 inline-block rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
                      >
                        View Property
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Property count and selected radius */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {propertiesWithLocation.length} nearby{" "}
            {propertiesWithLocation.length === 1
              ? "property"
              : "properties"}
          </p>

          <p className="text-sm font-medium text-teal-700">
            Within {radius} km
          </p>
        </div>

        {/* Nearby property cards */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900">
            Nearby Properties
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {propertiesWithLocation.map((property) => (
              <div
                key={property._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {property.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {property.type}
                    </p>
                  </div>

                  {property.distance !== undefined && (
                    <span className="whitespace-nowrap rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      {property.distance} km
                    </span>
                  )}
                </div>

                <p className="mt-4 text-lg font-bold text-slate-900">
                  ₹{Number(property.rent).toLocaleString("en-IN")}
                  <span className="text-sm font-normal text-slate-500">
                    {" "}/month
                  </span>
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {property.area ? `${property.area}, ` : ""}
                  {property.city}
                </p>

                <Link
                  to={`/properties/${property._id}`}
                  className="mt-4 block rounded-xl bg-teal-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-800"
                >
                  View Property
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreMap;
