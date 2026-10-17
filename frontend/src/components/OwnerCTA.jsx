import { ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

function OwnerCTA() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl bg-teal-700 px-8 py-12 md:px-14 md:py-16">
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
            
            <div className="max-w-2xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                <Building2 size={24} />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Have a place to rent?
              </h2>

              <p className="mt-4 max-w-xl text-lg leading-8 text-teal-50">
                List your PG, room, flat, apartment or house on StayEasyy
                and connect with people looking for a place to stay.
              </p>
            </div>

            <Link
              to="/owner"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-teal-700 transition hover:bg-teal-50"
            >
              List your property
              <ArrowRight size={19} />
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}

export default OwnerCTA;