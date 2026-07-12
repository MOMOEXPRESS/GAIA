"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/journal", label: "Symptom Journal" },
  { href: "/protocols", label: "Protocols" },
  { href: "/doctor", label: "For Doctors" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gaia-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-gaia-800">
          <Leaf className="h-6 w-6 text-gaia-600" />
          Gaia
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-sm font-medium transition",
                pathname === link.href
                  ? "text-gaia-700"
                  : "text-gaia-600 hover:text-gaia-800"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-full bg-gaia-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-gaia-700"
          >
            Sign in
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-gaia-100 px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-gaia-700"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="mt-2 block rounded-full bg-gaia-600 px-4 py-2 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
        </nav>
      )}
    </header>
  );
}
