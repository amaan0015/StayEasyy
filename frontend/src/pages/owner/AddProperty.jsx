import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AddProperty() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "PG",
    rent: "",
    securityDeposit: "",
    address: "",
    city: "",
    area: "",
    latitude: "",
    longitude: "",
    amenities: "",
    availableFrom: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);

    if (selectedImages.length > 5) {
      setMessage("You can upload a maximum of 5 images.");
      return;
    }

    setImages(selectedImages);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("type", formData.type);
      data.append("rent", formData.rent);
      data.append(
        "securityDeposit",
        formData.securityDeposit
      );
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("area", formData.area);
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);
      data.append(
        "amenities",
        JSON.stringify(
          formData.amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );
      data.append(
        "availableFrom",
        formData.availableFrom
      );

      // Add images
      images.forEach((image) => {
        data.append("images", image);
      });

      await api.post("/properties", data);

      setMessage(
        "Property submitted successfully. Waiting for admin approval."
      );

      setTimeout(() => {
        navigate("/owner");
      }, 1500);
    } catch (error) {
      console.error(
        "Failed to create property:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to create property."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Add Property
          </h1>

          <p className="mt-2 text-slate-500">
            Add your property to StayEasyy.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-sm"
        >

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Property Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Comfortable PG near college"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              rows="5"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Property Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="PG">PG</option>
              <option value="Hostel">Hostel</option>
              <option value="Room">Room</option>
              <option value="Flat">Flat</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
            </select>
          </div>

          {/* Rent + Deposit */}
          <div className="grid gap-6 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Monthly Rent
              </label>

              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                placeholder="8000"
                min="0"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Security Deposit
              </label>

              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                placeholder="10000"
                min="0"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

          </div>

          {/* Address */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Address
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Road"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          {/* City + Area */}
          <div className="grid gap-6 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Bhilai"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Area
              </label>

              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Kohka"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      Latitude
    </label>

    <input
      type="number"
      step="any"
      name="latitude"
      value={formData.latitude}
      onChange={handleChange}
      placeholder="e.g. 21.1938"
      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-600"
    />
  </div>

  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      Longitude
    </label>

    <input
      type="number"
      step="any"
      name="longitude"
      value={formData.longitude}
      onChange={handleChange}
      placeholder="e.g. 81.3509"
      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-600"
    />
  </div>
</div>

          {/* Amenities */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Amenities
            </label>

            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="WiFi, Parking, AC, Food"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <p className="mt-1 text-xs text-slate-400">
              Separate amenities using commas.
            </p>
          </div>

          {/* Available From */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Available From
            </label>

            <input
              type="date"
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          {/* Images */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Property Images
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full rounded-xl border border-slate-300 p-3"
            />

            <p className="mt-2 text-xs text-slate-400">
              You can upload up to 5 images. Maximum 5 MB per image.
            </p>

            {/* Selected images */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">

                {images.map((image, index) => (
                  <div
                    key={`${image.name}-${index}`}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Property ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />

                    <p className="truncate px-2 py-2 text-xs text-slate-500">
                      {image.name}
                    </p>
                  </div>
                ))}

              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Submitting..."
              : "Submit Property"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddProperty;