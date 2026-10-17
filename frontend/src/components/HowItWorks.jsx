
import {
  Search,
  SlidersHorizontal,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find your kind of place",
    description:
      "Choose your preferred location, property type, and monthly budget to discover places that suit your lifestyle.",
    points: ["Location-based search", "Budget-friendly options"],
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "Explore & compare",
    description:
      "Compare rent, photos, amenities, and property details so you can shortlist the places that feel right.",
    points: ["Detailed property listings", "Save your favourites"],
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Connect with owners",
    description:
      "Send an enquiry, ask questions, arrange a visit, and discuss the details directly with the property owner.",
    points: ["Direct enquiries", "Easy communication"],
  },
];

function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 px-5 py-20 sm:px-8 md:py-24">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-teal-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-cyan-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-800 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            Your journey starts here
          </span>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Your next place,
            <span className="block text-teal-700">
              without the hassle.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Finding a place to stay shouldn't be complicated.
            Discover suitable properties, compare your options,
            and connect with owners — all with StayEasyy.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
          {/* Connecting line on desktop */}
          <div className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-12 hidden border-t-2 border-dashed border-teal-200 md:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="group relative rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 sm:p-8"
              >
                {/* Step number and icon */}
                <div className="relative flex items-center justify-between">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-8 ring-white transition duration-300 group-hover:bg-teal-700 group-hover:text-white">
                    <Icon size={27} strokeWidth={1.8} />
                  </div>

                  <span className="text-5xl font-black tracking-tight text-slate-100 transition-colors group-hover:text-teal-50">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {step.title}
                </h3>

                <p className="mt-4 min-h-[84px] text-sm leading-7 text-slate-600 sm:text-base">
                  {step.description}
                </p>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  {step.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2.5 text-sm font-medium text-slate-700"
                    >
                      <CheckCircle2
                        size={17}
                        className="shrink-0 text-teal-600"
                      />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
          <Link
            to="/properties"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:-translate-y-0.5 hover:bg-teal-800 sm:w-auto"
          >
            Explore properties
            <ArrowRight size={18} />
          </Link>

          <p className="text-sm text-slate-500">
            Your search for a better place starts here.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
