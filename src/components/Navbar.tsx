"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { USER_KEY, clearSession, getSession } from "@/lib/auth";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Re-read the session on every route change (login / logout / expired-token redirects all navigate)
  // and when another tab signs in or out.
  useEffect(() => {
    setLoggedIn(getSession() !== null);
  }, [pathname]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === USER_KEY) setLoggedIn(getSession() !== null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    clearSession();
    setLoggedIn(false);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const navLinks = [
    { name: "Services", href: "/services.html" },
    { name: "Industries", href: "/industries.html" },
    { name: "BalSaathi", href: "/balsaathi", badge: "PRODUCT" },
    { name: "Work", href: "/work.html" },
    { name: "About", href: "/about.html" },
    { name: "Careers", href: "/careers.html" },
  ];

  return (
    <>
      <header id="hdr" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
        <div className="wrap nav flex items-center justify-between py-3 px-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="logo flex items-center gap-2 font-bold text-xl text-slate-900 tracking-tight"
            aria-label="SayNeel Technologies — home"
          >
            <span className="logo-mark flex items-center justify-center w-8 h-8 rounded-lg bg-blue-700 text-white font-extrabold text-lg shadow-sm" aria-hidden="true">
              S
            </span>
            <span className="font-heading">SayNeel</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-links hidden md:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Primary">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors hover:text-blue-700 flex items-center gap-1.5 ${
                    isActive ? "text-blue-700 font-semibold" : ""
                  }`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="nav-cta flex items-center gap-3">
            {/* PORTAL LOGIN BUTTON (The Manager's Feature Entrypoint) — becomes Logout once signed in */}
            {loggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-sm font-semibold shadow-sm hover:from-blue-800 hover:to-indigo-900 transition-all hover:shadow cursor-pointer"
                title="Sign out of the BalSaathi portal"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-sm font-semibold shadow-sm hover:from-blue-800 hover:to-indigo-900 transition-all hover:shadow"
                title="BalSaathi Role-Based Web Portal"
              >
                <LogIn className="w-4 h-4" />
                <span>Portal Login</span>
              </Link>
            )}

            <Link
              href="/contact.html"
              className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors"
            >
              Contact
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-white border-b border-slate-200 p-4 shadow-xl z-40 transition-all animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3 pb-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/contact.html"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Contact
            </Link>
            <div className="pt-2 border-t border-slate-100">
              {loggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-700 text-white font-semibold text-center shadow cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-700 text-white font-semibold text-center shadow"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Portal Login</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
