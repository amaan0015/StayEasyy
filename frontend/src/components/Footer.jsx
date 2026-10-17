import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-950 px-6 py-14 text-slate-300">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-white">
              StayEasyy
            </Link>

            <p className="mt-4 max-w-md leading-7 text-slate-400">
              Find PGs, rooms, hostels, apartments and rental homes
              near the places that matter to you.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Find a place that fits your life.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-white">
              Explore
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link
                to="/properties"
                className="hover:text-teal-400"
              >
                Properties
              </Link>

              <Link
                to="/how-it-works"
                className="hover:text-teal-400"
              >
                How it works
              </Link>

              <Link
                to="/about"
                className="hover:text-teal-400"
              >
                About us
              </Link>

              <Link
                to="/contact"
                className="hover:text-teal-400"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* For owners */}
          <div>
            <h3 className="font-semibold text-white">
              For owners
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link
                to="/owner"
                className="hover:text-teal-400"
              >
                List your property
              </Link>

              <Link
                to="/login"
                className="hover:text-teal-400"
              >
                Owner login
              </Link>

              <Link
                to="/register"
                className="hover:text-teal-400"
              >
                Create account
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-5 border-t border-slate-800 pt-6 md:flex-row md:items-center md:justify-between">

          <p className="text-sm text-slate-500">
            © 2026 StayEasyy. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-teal-400"
            >
              <Instagram size={18} />
            </a>

            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-teal-400"
            >
              <Facebook size={18} />
            </a>

            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-teal-400"
            >
              <Linkedin size={18} />
            </a>

            <a
              href="mailto:hello@stayeasy.com"
              aria-label="Email"
              className="hover:text-teal-400"
            >
              <Mail size={18} />
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;