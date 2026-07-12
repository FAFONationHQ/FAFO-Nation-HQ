"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavItem = {
  label: string;
  href?: string;
  highlight?: boolean;
  cares?: boolean;
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
    label: "FAFO Cares",
    cares: true,
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

  const renderNavLabel = (item: NavItem) => {
    if (!item.cares) {
      return item.label;
    }

    return (
      <>
        <span className="text-white">{item.label}</span>

        <span
          aria-hidden="true"
          className="inline-block origin-center animate-[pulse_1.1s_ease-in-out_infinite]"
        >
          ❤️
        </span>
      </>
    );
  };

  return (
    <header
      ref={headerRef}
      className="relative z-40 w-full border-b border-white/10 bg-black"
    >
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between px-5 sm:px