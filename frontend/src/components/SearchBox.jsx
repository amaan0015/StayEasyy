import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SearchBox() {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (location.trim()) {
      params.set("location", location.trim());
    }

    if (propertyType) {
      params.set("type", propertyType);
    }

    if (budget) {
      params.set("maxRent", budget);
    }

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-3 rounded-2xl bg-white p-3 shadow-xl md:grid-cols-[1.5fr_1fr_1fr_auto]"
    >

      {/* Location */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">

        <MapPin
          size={20}
          className="shrink-0 text-teal-700"
        />

        <div className="w-full">

          <label className="block text-xs font-semibold text-slate-500">
            Location
          </label>

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, area or landmark"
            className="mt-1 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />

        </div>

      </div>


      {/* Property Type */}
      <div className="rounded-xl border border-slate-200 px-4 py-3">

        <label className="block text-xs font-semibold text-slate-500">
          Property type
        </label>

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="mt-1 w-full bg-transparent text-sm text-slate-800 outline-none"
        >

          <option value="">
            Any type
          </option>

          <option value="PG">
            PG
          </option>

          <option value="Hostel">
            Hostel
          </option>

          <option value="Room">
            Room
          </option>

          <option value="Flat">
            Flat
          </option>

          <option value="Apartment">
            Apartment
          </option>

          <option value="House">
            House
          </option>

        </select>

      </div>


      {/* Budget */}
      <div className="rounded-xl border border-slate-200 px-4 py-3">

        <label className="block text-xs font-semibold text-slate-500">
          Monthly budget
        </label>

        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="mt-1 w-full bg-transparent text-sm text-slate-800 outline-none"
        >

          <option value="">
            Any budget
          </option>

          <option value="5000">
            Under ₹5,000
          </option>

          <option value="8000">
            Under ₹8,000
          </option>

          <option value="12000">
            Under ₹12,000
          </option>

          <option value="20000">
            Under ₹20,000
          </option>

        </select>

      </div>


      {/* Search button */}
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800"
      >

        <Search size={20} />

        <span className="md:hidden">
          Search
        </span>

      </button>

    </form>
  );
}

export default SearchBox;