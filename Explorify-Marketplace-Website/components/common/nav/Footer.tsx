import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#1d6fa5] text-slate-200 mt-auto">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="text-2xl font-extrabold text-white mb-3 tracking-wide notranslate" translate="no">
              ExplorifyTrips
            </div>
            <p className="text-sm text-slate-300 mb-4 max-w-sm">
              Discover amazing destinations and book unforgettable experiences
              with trusted tour operators.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-[#252e4d] flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <span className="text-sm font-semibold text-white">f</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-[#252e4d] flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <span className="text-sm font-semibold text-white">ig</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-[#252e4d] flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <span className="text-sm font-semibold text-white">𝕏</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="font-semibold text-white mb-4">Quick Links</div>
            <ul className="text-sm space-y-2">
              <li>
                <Link
                  href="/trips"
                  className="text-slate-300 hover:text-sky-300 transition-colors"
                >
                  Browse Trips
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="text-slate-300 hover:text-sky-300 transition-colors"
                >
                  My Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-300 hover:text-sky-300 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-slate-300 hover:text-sky-300 transition-colors"
                >
                  Travel Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <div className="font-semibold text-white mb-4">Legal & Support</div>
            <ul className="text-sm space-y-2">
              <li>
                <Link
                  href="https://merchant.razorpay.com/policy/Rn6lxkXvDOSLbk/terms"
                  className="text-slate-300 hover:text-sky-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="https://merchant.razorpay.com/policy/Rn6lxkXvDOSLbk/privacy"
                  className="text-slate-300 hover:text-sky-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="https://merchant.razorpay.com/policy/Rn6lxkXvDOSLbk/refund"
                  className="text-slate-300 hover:text-sky-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cancellation & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="https://merchant.razorpay.com/policy/Rn6lxkXvDOSLbk/contact_us"
                  className="text-slate-300 hover:text-sky-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <div className="font-semibold text-white mb-4">Get in Touch</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-sky-300 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:info.explorifytrips@gmail.com"
                  className="text-slate-300 hover:text-sky-300 transition-colors break-all"
                >
                  info.explorifytrips@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Indore, India</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="font-semibold text-white text-sm mb-2">
                We Accept
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="px-2 py-1 bg-slate-800 rounded text-xs font-semibold">
                  VISA
                </div>
                <div className="px-2 py-1 bg-slate-800 rounded text-xs font-semibold">
                  Mastercard
                </div>
                <div className="px-2 py-1 bg-slate-800 rounded text-xs font-semibold">
                  UPI
                </div>
                <div className="px-2 py-1 bg-slate-800 rounded text-xs font-semibold">
                  Wallets
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-400">
            © {new Date().getFullYear()}{" "}
            <span className="text-white font-semibold notranslate" translate="no">
              ExplorifyTrips
            </span>
            . All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Made with ❤️ in India</span>
            <span>•</span>
            <span>Powered by Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
