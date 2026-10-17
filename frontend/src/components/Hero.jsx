import SearchBox from "./SearchBox";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-900">

      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.78),rgba(15,23,42,0.88))]" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[600px] max-w-7xl items-center px-6 py-20">

        <div className="w-full text-center">

          {/* Small heading */}
          <div className="mx-auto mb-5 inline-flex rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm font-medium text-teal-300">
            Find a place near what matters
          </div>


          {/* Main heading */}
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">

            Find a place that
            <span className="block text-teal-400">
              fits your life.
            </span>

          </h1>


          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">

            Discover verified PGs, rooms, hostels, apartments
            and rental homes near your college, workplace or
            anywhere you want to live.

          </p>


          {/* Search */}
          <SearchBox />

        </div>

      </div>

    </section>
  );
}

export default Hero;