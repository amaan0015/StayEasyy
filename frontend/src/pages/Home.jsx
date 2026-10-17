import Navbar from "../components/NavBar.jsx";
import Hero from "../components/Hero";
import FeaturedProperties from "../components/FeaturedProperties";
import HowItWorks from "../components/HowItWorks";
import TrustSection from "../components/TrustSection";
import OwnerCTA from "../components/OwnerCTA";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <Hero />
        <FeaturedProperties />
        <HowItWorks />
        <TrustSection />
        <OwnerCTA />
      </main>
      <Footer />
    </div>
  );
}

export default Home;