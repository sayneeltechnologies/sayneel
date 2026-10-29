import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-white">
                S
              </span>
              SayNeel Technologies
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Enterprise software, AI systems, and healthcare platforms built for real-world impact.
              Creators of the <strong>BalSaathi</strong> maternal & child health ecosystem.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Access BalSaathi Portal &rarr;
              </Link>
            </div>
          </div>

          {/* Col 1 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/services.html#web" className="hover:text-white transition">Website Development</a></li>
              <li><a href="/services.html#enterprise" className="hover:text-white transition">Enterprise Software</a></li>
              <li><a href="/services.html#cloud" className="hover:text-white transition">Cloud Solutions</a></li>
              <li><a href="/services.html#ai" className="hover:text-white transition">AI Solutions</a></li>
              <li><a href="/services.html" className="hover:text-white transition">All Services</a></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Products & Work</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/balsaathi" className="hover:text-white transition text-blue-400 font-medium">BalSaathi Platform</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Web Dashboard</Link></li>
              <li><a href="/work.html" className="hover:text-white transition">Portfolio</a></li>
              <li><a href="/industries.html" className="hover:text-white transition">Industries</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/about.html" className="hover:text-white transition">About SayNeel</a></li>
              <li><a href="/careers.html" className="hover:text-white transition">Careers</a></li>
              <li><a href="/contact.html" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="/privacy-policy.html" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="/terms.html" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} SayNeel Technologies Private Limited. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/privacy-policy.html" className="hover:text-slate-300">Privacy</a>
            <a href="/terms.html" className="hover:text-slate-300">Terms</a>
            <a href="/cookie-policy.html" className="hover:text-slate-300">Cookies</a>
            <a href="/contact.html" className="hover:text-slate-300">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
