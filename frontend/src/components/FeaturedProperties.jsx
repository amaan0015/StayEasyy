import PropertyCard from "./PropertyCard";

const properties = [
  {
    id: 1,
    title: "Green Valley PG",
    type: "PG",
    location: "Kankarbagh, Patna",
    distance: "1.2 km",
    rent: 7000,
    rating: 4.5,
    reviews: 38,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 2,
    title: "Urban Nest Apartment",
    type: "Apartment",
    location: "Rajendra Nagar, Patna",
    distance: "2.1 km",
    rent: 12000,
    rating: 4.7,
    reviews: 24,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 3,
    title: "Comfort Stay Rooms",
    type: "Room",
    location: "Boring Road, Patna",
    distance: "0.8 km",
    rent: 6000,
    rating: 4.3,
    reviews: 51,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 4,
    title: "City View Hostel",
    type: "Hostel",
    location: "Fraser Road, Patna",
    distance: "3.0 km",
    rent: 7500,
    rating: 4.6,
    reviews: 42,
    image:
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
  },
];

function FeaturedProperties() {
  return (
    <section className="bg-white px-6 py-20">

      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
              Explore stays
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Places you might love
            </h2>

            <p className="mt-3 max-w-2xl text-slate-500">
              Discover comfortable places to stay in popular
              locations, selected for quality and convenience.
            </p>

          </div>


          <a
            href="/properties"
            className="text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            View all properties →
          </a>

        </div>


        {/* Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}

        </div>

      </div>

    </section>
  );
}

export default FeaturedProperties;