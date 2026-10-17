import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function EditProperty() {
  const { id } = useParams();
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
    amenities: "",
    availableFrom: "",
  });

  // Existing images already saved in the database
  const [existingImages, setExistingImages] = useState([]);

  // New images selected from the computer
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // Create preview URLs and revoke them when images change or the page unmounts.
  useEffect(() => {
    const previewUrls = newImages.map((image) => URL.createObjectURL(image));
    setNewImagePreviews(previewUrls);

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Get property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/my/${id}`);

        const property = response.data.property;

        setFormData({
          title: property.title || "",
          description: property.description || "",
          type: property.type || "PG",
          rent: property.rent || "",
          securityDeposit: property.securityDeposit || "",
          address: property.address || "",
          city: property.city || "",
          area: property.area || "",
          amenities: property.amenities?.join(", ") || "",
          availableFrom: property.availableFrom
            ? property.availableFrom.split("T")[0]
            : "",
        });

        setExistingImages(property.images || []);
      } catch (error) {
        console.error("Failed to fetch property:", error);

        setError(
          error.response?.data?.message || "Unable to load property."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Handle normal form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Handle new image selection
  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);

    if (selectedImages.length > 5) {
      setError("You can select a maximum of 5 new images.");
      return;
    }

    setNewImages(selectedImages);
    setError("");
    setMessage("");
  };

  // Remove an existing image from database
  const handleRemoveExistingImage = async (imageUrl) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.delete(`/properties/${id}/images`, {
        data: {
          imageUrl,
        },
      });

      setExistingImages(response.data.images);

      setMessage(
        "Image removed successfully. This change has already been saved, and the listing will need admin approval again."
      );
    } catch (error) {
      console.error("Failed to remove image:", error);

      setError(
        error.response?.data?.message || "Unable to remove image."
      );
    }
  };

  // Remove a newly selected image before uploading
  const handleRemoveNewImage = (indexToRemove) => {
    setNewImages((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  };

  // Submit property changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("type", formData.type);
      data.append("rent", formData.rent);
      data.append("securityDeposit", formData.securityDeposit);
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("area", formData.area);

      data.append(
        "amenities",
        JSON.stringify(
          formData.amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

      data.append("availableFrom", formData.availableFrom);

      // Add newly selected images
      newImages.forEach((image) => {
        data.append("images", image);
      });

      await api.put(`/properties/${id}`, data);

      setMessage(
        "Property updated successfully. It is now waiting for admin approval."
      );

      setTimeout(() => {
        navigate("/owner");
      }, 1500);
    } catch (error) {
      console.error("Failed to update property:", error);

      setError(
        error.response?.data?.message || "Unable to update property."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading property...</p>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => navigate("/owner")}
            className="mt-4 font-medium text-teal-700 hover:underline"
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/owner")}
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          ← Back to dashboard
        </button>

        {/* Page heading */}
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Edit Property
          </h1>

          <p className="mt-2 text-slate-500">
            Update your property information.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="mt-6 rounded-xl bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8"
        >

          {/* ================= EXISTING IMAGES ================= */}

          {existingImages.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Existing Images
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                These images are already uploaded for this property.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                {existingImages.map((image, index) => (
                  <div
                    key={image}
                    className="relative overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="h-40 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveExistingImage(image)
                      }
                      className="absolute right-2 top-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= NEW IMAGES ================= */}

          <div className="mt-8">
            <label className="text-sm font-medium text-slate-700">
              Add New Images
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />

            <p className="mt-1 text-xs text-slate-500">
              You can select up to 5 new images.
            </p>
          </div>

          {/* New image previews */}
          {newImages.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900">
                New Images
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                {newImages.map((image, index) => (
                  <div
                    key={`${image.name}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img
                      src={newImagePreviews[index] || ""}
                      alt={`New property ${index + 1}`}
                      className="h-40 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute right-2 top-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TITLE ================= */}

          <div className="mt-8">
            <label className="text-sm font-medium text-slate-700">
              Property Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
            />
          </div>

          {/* ================= DESCRIPTION ================= */}

          <div className="mt-6">
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
            />
          </div>

          {/* ================= TYPE + RENT ================= */}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Property Type
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
              >
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Room">Room</option>
                <option value="Flat">Flat</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Monthly Rent
              </label>

              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                min="0"
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* ================= SECURITY DEPOSIT ================= */}

          <div className="mt-6">
            <label className="text-sm font-medium text-slate-700">
              Security Deposit
            </label>

            <input
              type="number"
              name="securityDeposit"
              value={formData.securityDeposit}
              onChange={handleChange}
              min="0"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
            />
          </div>

          {/* ================= ADDRESS ================= */}

          <div className="mt-6">
            <label className="text-sm font-medium text-slate-700">
              Full Address
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
            />
          </div>

          {/* ================= CITY + AREA ================= */}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Area
              </label>

              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* ================= AMENITIES ================= */}

          <div className="mt-6">
            <label className="text-sm font-medium text-slate-700">
              Amenities
            </label>

            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="WiFi, Parking, AC, Food"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
            />

            <p className="mt-1 text-xs text-slate-500">
              Separate amenities using commas.
            </p>
          </div>

          {/* ================= AVAILABLE FROM ================= */}

          <div className="mt-6">
            <label className="text-sm font-medium text-slate-700">
              Available From
            </label>

            <input
              type="date"
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
            />
          </div>

          {/* ================= BUTTONS ================= */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/owner")}
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProperty;