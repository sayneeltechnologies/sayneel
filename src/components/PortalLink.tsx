"use client";

import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";

const DASHBOARD_PATH = "/dashboard";

// Link into the BalSaathi portal: goes to sign in, or — when already signed in — opens the
// dashboard in a new tab (the session is in localStorage, so the new tab is signed in too).
export default function PortalLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!getSession()) return;
    e.preventDefault();
    window.open(DASHBOARD_PATH, "_blank", "noopener");
  };

  return (
    <Link href="/login" onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
