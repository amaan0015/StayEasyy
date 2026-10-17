import {
  BadgeCheck,
  MapPinned,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

const trustFeatures = [
  {
    icon: BadgeCheck,
    title: "Verified listings",
    description:
      "Properties can be reviewed and verified before appearing on the platform.",
  },
  {
    icon: MapPinned,
    title: "Know the location",
    description:
      "See exactly where a property is and how far it is from your preferred location.",
  },
  {
    icon: MessageCircle,
    title: "Connect directly",
    description:
      "Ask owners questions and discuss the property before making a decision.",
  },
  {
    icon: ShieldCheck,
    title: "Built for safer stays",
    description:
      "Report suspicious listings and help keep the StayEasyy community trustworthy.",
  },
];

function TrustSection() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left side */}
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
              Stay with confidence
            </p>

            <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              A better way to find a place you can trust.
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-500">
              Finding a room or home shouldn't feel like a gamble. StayEasyy
              gives you the information you need to compare places and make
              better decisions.
            </p>

            <div className="mt-8 rounded-2xl bg-slate-900 p-7 text-white">
              <p className="text-lg font-semibold">
                Find a place near what matters.
              </p>

              <p className="mt-2 leading-7 text-slate-300">
                College, office, metro, hospital, railway station or anywhere
                else — search around the places that matter to your daily life.
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="grid gap-5 sm:grid-cols-2">
            {trustFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustSection;