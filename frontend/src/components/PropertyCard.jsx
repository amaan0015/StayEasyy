import { Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

function PropertyCard({ property }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Image */}
      <div className="relative h-56 overflow-hidden">

        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Property type */}
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow">
          {property.type}
        </span>

        {/* Favourite */}
        <button
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow transition hover:text-red-500"
          aria-label="Save property"
        >
          <Heart size={18} />
        </button>

      </div>


      {/* Content */}
      <div className="p-5">

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">

          <Star
            size={16}
            className="fill-yellow-400 text-yellow-400"
          />

          <span className="font-semibold text-slate-800">
            {property.rating}
          </span>

          <span className="text-slate-400">
            ({property.reviews} reviews)
          </span>

        </div>


        {/* Title */}
        <h3 className="mt-2 text-lg font-bold text-slate-900">
          {property.title}
        </h3>


        {/* Location */}
        <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">

          <MapPin size={15} />

          <span>
            {property.location}
          </span>

        </div>


        {/* Distance */}
        <p className="mt-1 text-sm text-teal-700">
          {property.distance} from your location
        </p>


        {/* Bottom */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

          <div>
            <span className="text-xl font-bold text-slate-900">
              ₹{property.rent.toLocaleString()}
            </span>

            <span className="text-sm text-slate-500">
              /month
            </span>
          </div>


          <Link
            to={`/properties/${property.id}`}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            View
          </Link>

        </div>

      </div>

    </div>
  );
}

export default PropertyCard;