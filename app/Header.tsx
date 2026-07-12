"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavItem = {
  label: string;
  href?: string;
  highlight?: boolean;
  children?: {
    label: string;
    href: string;
    description: string;
  }[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Join the Nation",
    href: "/join",
    highlight: true,
  },
  {
    label: "Store",
    children: [
      {
        label: "Shop All Gear",
        href: "/store",
        description: "Explore the full FAFO Nation gear lineup.",
      },
      {
        label: "Featured Deployments",
        href: "/store/featured",
        description: "Highlighted gear and current featured releases.",
      },
      {
        label: "Collections",
        href: "/store/collections",
        description: "Browse FAFO Nation gear by collection.",
      },
      {
        label: "FAFO Cares",
        href: "/store/fafo-cares",
        description: "Shop merchandise supporting FAFO Cares campaigns.",
      },
    ],
  },
  {
    label: "Community",
    children: [
      {
        label: "FAFO Family",
        href: "/community",
        description: "The people and community behind FAFO Nation.",
      },
      {
        label: "Deployed Members",
        href: "/community/deployed-members",
        description: "Discover members who choose to deploy publicly.",
      },
      {
        label: "Community Activity",
        href: "/community/activity",
        description: "See what is happening across the Nation.",
      },
      {
        label: "Events & Contests",
        href: "/community/events",
        description: "Community events, competitions, and contests.",
      },
    ],
  },
  {
    label: "Global Operations",
    children: [
      {
        label: "FAFO World",
        href: "/fafo-world",
        description: "Explore the Nation, deployed worldwide.",
      },
      {
        label: "Recently Deployed",
        href: "/recently-deployed",
        description: "View verified public deployment activity.",
      },
    ],
  },
  {
    label: "FAFO Cares ❤️",
    children: [
      {
        label: "FAFO Cares",
        href: "/fafo-cares",
        description: "Learn about the mission behind FAFO Cares.",
      },
      {
        label: "Current Campaigns",
        href: "/fafo-cares/campaigns",
        description: "See active FAFO Cares campaigns and initiatives.",
      },
      {
        label: "Support & Crisis Resources",
        href: "/fafo-cares/support",
        description: "Find support resources and crisis-help information.",
      },
    ],
  },
  {
    label: "About",
    children: [
      {
        label: "Our Story",
        href: "/about",
        description: "Learn how FAFO Nation began and what it stands for.",
      },
      {
        label: "Sgt Swagger",
        href: "/about/sgt-swagger",
        description: "Meet the official FAFO Nation Brand Ambassador.",
      },
      {
        label: "Contact",
        href: "/contact",
        description: "Contact FAFO Nation.",
      },
    ],
  },
];

export default function Header() {
  const headerRef = useRef<HTMLElement | null>(null);

  const [openDesktopMenu, setOpenDesktopMenu] =
    useState<string | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [openMobileMenu, setOpenMobileMenu] =
    useState<string | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenDesktopMenu(null);
        setMobileMenuOpen(false);
        setOpenMobileMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopMenu(null);
        setMobileMenuOpen(false);
        setOpenMobileMenu(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  const closeNavigation = () => {
    setOpenDesktopMenu(null);
    setMobileMenuOpen(false);
    setOpenMobileMenu(null);
  };

  const toggleDesktopMenu = (label: string) => {
    setOpenDesktopMenu((current) =>
      current === label ? null : label,
    );
  };

  const toggleMobileMenu = (label: string) => {
    setOpenMobileMenu((current) =>
      current === label ? null : label,
    );
  };

  return (
    <header
      ref={headerRef}
      className="relative z-40 w-full border-b border-white/10 bg-black"
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-10 lg:px-16">
        {/* DESKTOP NAVIGATION */}
        <nav
          aria-label="Main navigation"
          className="hidden h-full items-center lg:flex"
        >
          {NAV_ITEMS.map((item) => {
            if (item.children) {
              const isOpen = openDesktopMenu === item.label;

              return (
                <div
                  key={item.label}
                  className="relative flex h-full items-center"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleDesktopMenu(item.label)
                    }
                    aria-expanded={isOpen}
                    className="flex h-full items-center gap-2 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-white/65 transition hover:text-white xl:px-4 xl:text-xs"
                  >
                    {item.label}

                    <span
                      aria-hidden="true"
                      className={`text-[9px] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 top-full z-50 w-80 border border-white/15 bg-black shadow-2xl">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeNavigation}
                          className="group block border-b border-white/10 px-6 py-5 transition last:border-b-0 hover:bg-neutral-950"
                        >
                          <span className="block text-xs font-black uppercase tracking-[0.14em] text-white transition group-hover:text-[#D4AF37]">
                            {child.label}
                          </span>

                          <span className="mt-2 block text-xs leading-5 text-white/40">
                            {child.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href ?? "/"}
                onClick={closeNavigation}
                className={
                  item.highlight
                    ? "mx-3 border border-red-600/70 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-red-500 transition hover:bg-red-700 hover:text-white xl:text-xs"
                    : "px-3 text-[10px] font-black uppercase tracking-[0.14em] text-white/65 transition hover:text-white xl:px-4 xl:text-xs"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* MOBILE HEADER */}
        <div className="flex w-full items-center justify-between lg:hidden">
          <Link
            href="/"
            onClick={closeNavigation}
            className="text-sm font-black uppercase tracking-[0.2em] text-white"
          >
            FAFO Nation
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((current) => !current);
              setOpenMobileMenu(null);
            }}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle main navigation"
            className="flex min-h-12 min-w-12 items-center justify-center border border-white/15 text-xl text-white"
          >
            {mobileMenuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION PANEL */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="absolute left-0 top-full z-50 max-h-[calc(100dvh-8rem)] w-full overflow-y-auto border-t border-white/10 bg-black lg:hidden"
        >
          {NAV_ITEMS.map((item) => {
            if (item.children) {
              const isOpen = openMobileMenu === item.label;

              return (
                <div
                  key={item.label}
                  className="border-b border-white/10"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleMobileMenu(item.label)
                    }
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between px-5 py-5 text-left text-xs font-black uppercase tracking-[0.16em] text-white/75"
                  >
                    {item.label}

                    <span
                      aria-hidden="true"
                      className={`transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/10 bg-neutral-950">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeNavigation}
                          className="block border-b border-white/10 px-8 py-5 last:border-b-0"
                        >
                          <span className="block text-xs font-black uppercase tracking-[0.14em] text-[#D4AF37]">
                            {child.label}
                          </span>

                          <span className="mt-2 block text-xs leading-5 text-white/40">
                            {child.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href ?? "/"}
                onClick={closeNavigation}
                className={
                  item.highlight
                    ? "block border-b border-red-600/30 px-5 py-5 text-xs font-black uppercase tracking-[0.16em] text-red-500"
                    : "block border-b border-white/10 px-5 py-5 text-xs font-black uppercase tracking-[0.16em] text-white/75"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}