"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavItem = {
  label: string;
  href?: string;
  highlight?: boolean;
  cares?: boolean;
  customShop?: boolean;
  icon?: string;
  children?: { label: string; href: string; description: string }[];
};


const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Join the Nation", href: "/join", highlight: true },
  { label: "Merch", icon: "👕", children: [
    { label: "Shop All Gear", href: "/store", description: "Explore the full FAFO Nation gear lineup." },
    { label: "Featured Deployments", href: "/store/featured", description: "Highlighted gear and current featured releases." },
    { label: "Collections", href: "/store/collections", description: "Browse FAFO Nation gear, including seasonal collections." },
    { label: "Limited Edition Drops", href: "/store/limited-drops", description: "Explore limited-run FAFO Nation releases." },
    { label: "Challenge Coins", href: "/store/challenge-coins", description: "Browse FAFO Nation challenge coins and special releases." },
    { label: "Morale Patches", href: "/store/morale-patches", description: "Explore FAFO Nation morale patches." },
    { label: "Apparel Collaborations", href: "/store/collaborations", description: "Discover FAFO Nation apparel collaborations." },
    { label: "Community Outreach Lines", href: "/store/community-outreach", description: "Shop merchandise connected to community outreach initiatives." },
    { label: "Premium Collector Items", href: "/store/collector-items", description: "Explore premium and collector-focused FAFO Nation items." },
    { label: "FAFO Cares Merchandise", href: "/store/fafo-cares", description: "Shop merchandise supporting FAFO Cares campaigns." },
  ]},
  { label: "Custom Shop", customShop: true, icon: "🔧", children: [
    { label: "Start a Custom Project", href: "/custom-shop/start", description: "Submit your idea, references, sketches, and project requirements." },
    { label: "Custom Gear Listings", href: "/custom-shop/listings", description: "Review custom items and approved projects ready for purchase." },
    { label: "Custom Project Gallery", href: "/custom-shop/gallery", description: "Explore completed custom projects and get ideas for your own." },
    { label: "How Custom Gear Works", href: "/custom-shop/how-it-works", description: "Learn the FAFO Custom Shop process from idea to deployment." },
    { label: "Project Status", href: "/custom-shop/status", description: "Check the status of an active custom project." },
  ]},
  { label: "FAFO Cares", cares: true, icon: "❤️", children: [
    { label: "Need Help Now", href: "/fafo-cares/need-help-now", description: "Access urgent support and crisis-help resources." },
    { label: "Veteran Assistance Hub", href: "/fafo-cares/veterans", description: "Find veteran-focused assistance, programs, and resources." },
    { label: "Mental Health Resources", href: "/fafo-cares/mental-health", description: "Find mental health information and support resources." },
    { label: "Crisis Resource Page", href: "/fafo-cares/support", description: "Access crisis support resources and help information." },
    { label: "Charity Fundraising Pages", href: "/fafo-cares/fundraising", description: "Explore active FAFO Cares fundraising efforts." },
    { label: "Community Emergency Fund", href: "/fafo-cares/emergency-fund", description: "Learn about community emergency support initiatives." },
    { label: "Cancer Support Initiatives", href: "/fafo-cares/cancer-support", description: "Explore cancer support campaigns and initiatives." },
    { label: "Annual Charity Campaign", href: "/fafo-cares/annual-campaign", description: "Follow the annual FAFO Cares charity campaign." },
    { label: "Volunteer Opportunities", href: "/fafo-cares/volunteer", description: "Find ways to volunteer and support FAFO Cares." },
    { label: "Community Spotlight Stories", href: "/fafo-cares/spotlights", description: "Read stories highlighting people and community impact." },
  ]},
  { label: "Media & Content", icon: "🎮", children: [
    { label: "Videos", href: "/media/videos", description: "Watch FAFO Nation videos, including educational content." },
    { label: "Live Streams", href: "/media/live", description: "Find weekly themed streams and FAFO Nation live content." },
    { label: "Livestream Countdown", href: "/media/countdown", description: "See countdowns and details for upcoming livestreams." },
    { label: "Community Game Nights", href: "/media/game-nights", description: "Find scheduled community gaming events." },
    { label: "FAFO Featured Artist", href: "/media/featured-artist", description: "Discover artists featured by FAFO Nation." },
    { label: "Interview Series", href: "/media/interviews", description: "Watch FAFO Nation interviews and conversations." },
    { label: "Veteran Stories", href: "/media/veteran-stories", description: "Explore veteran stories shared through FAFO Nation." },
    { label: "Behind the Scenes", href: "/media/behind-the-scenes", description: "See the work and people behind FAFO Nation." },
    { label: "Podcasts", href: "/media/podcasts", description: "Listen to FAFO Nation podcast content." },
    { label: "Gallery", href: "/media/gallery", description: "Browse FAFO Nation photos, artwork, and visual media." },
    { label: "News & Updates", href: "/media/news", description: "Read the latest FAFO Nation news and updates." },
    { label: "FAFO Nation Content Wall", href: "/media/content-wall", description: "Discover FAFO Nation community creators and social media accounts." },
  ]},
  { label: "Community", icon: "🛡", children: [
    { label: "FAFO Family", href: "/community", description: "The people and community behind FAFO Nation." },
    { label: "Ranks & Achievements", href: "/community/ranks-achievements", description: "Explore the FAFO Nation rank system and achievement badges." },
    { label: "Recognition & Service", href: "/community/recognition", description: "Service recognition, optional veteran verification, and blue-collar recognition." },
    { label: "Member Spotlights", href: "/community/member-spotlights", description: "Meet members and recognize their stories and contributions." },
    { label: "Community Activity", href: "/community/activity", description: "See what is happening across the Nation." },
    { label: "Events & Contests", href: "/community/events", description: "Weekly community events, competitions, and meme contests." },
    { label: "Giveaways", href: "/community/giveaways", description: "Explore FAFO Nation giveaways and promotional community events." },
    { label: "Community Challenges", href: "/community/challenges", description: "Join organized challenges and participation campaigns." },
    { label: "Deployed Members", href: "/community/deployed-members", description: "Discover members who choose to deploy publicly." },
  ]},
  { label: "Global Operations", icon: "🌐", children: [
    { label: "FAFO World", href: "/fafo-world", description: "Explore the Nation, deployed worldwide." },
    { label: "Recently Deployed", href: "/recently-deployed", description: "View verified public deployment activity." },
  ]},
  { label: "About", icon: "❓", children: [
    { label: "Our Story", href: "/about", description: "Learn how FAFO Nation began and what it stands for." },
    { label: "Sgt Swagger", href: "/about/sgt-swagger", description: "Meet the official FAFO Nation Brand Ambassador." },
    { label: "Long-Term Vision", href: "/about/long-term-vision", description: "Explore future FAFO Nation initiatives, programs, chapters, and the proposed FAFO Foundation." },
    { label: "Contact", href: "/contact", description: "Contact FAFO Nation." },
  ]},
];


export default function Header() {
  const headerRef = useRef<HTMLElement | null>(null);

  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDesktopMenu(null);
        setMobileMenuOpen(false);
        setOpenMobileMenu(null);
      }
    };

    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopMenu(null);
        setMobileMenuOpen(false);
        setOpenMobileMenu(null);
      }
    };

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const closeNavigation = () => {
    setOpenDesktopMenu(null);
    setMobileMenuOpen(false);
    setOpenMobileMenu(null);
  };

  const label = (item: NavItem) => (
    <>
      <span
        className={item.cares ? "fafo-nav-cares" : "fafo-nav-red"}
        style={item.cares ? undefined : { color: "#DC2626" }}
      >
        {item.label}
      </span>

      {item.icon && (
        <span
          aria-hidden="true"
          className="inline-block origin-center animate-[pulse_1.1s_ease-in-out_infinite]"
        >
          {item.icon}
        </span>
      )}
    </>
  );

  const color = (item: NavItem) =>
    item.cares
      ? "fafo-nav-cares text-white"
      : "fafo-nav-red text-[#DC2626] hover:text-red-500";

  return (
    <>
      <header
        ref={headerRef}
        className="relative z-40 w-full border-b border-white/10 bg-black"
      >
        <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between px-5 sm:px-10 lg:px-16">
          <nav
            aria-label="Main navigation"
            className="hidden h-full items-center lg:flex"
          >
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative flex h-full items-center"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDesktopMenu((value) =>
                        value === item.label ? null : item.label
                      )
                    }
                    aria-expanded={openDesktopMenu === item.label}
                    className={`flex h-full items-center gap-1.5 px-2 text-[9px] font-black uppercase tracking-[0.08em] transition xl:px-3 xl:text-[10px] 2xl:px-4 2xl:text-xs ${color(item)}`}
                  >
                    {label(item)}

                    <span
                      aria-hidden="true"
                      className={`text-[8px] transition-transform ${
                        openDesktopMenu === item.label ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {openDesktopMenu === item.label && (
                    <div className="absolute left-0 top-full z-50 w-80 border border-white/15 bg-black shadow-2xl">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeNavigation}
                          className="group block border-b border-white/10 px-6 py-3 transition last:border-b-0 hover:bg-neutral-950"
                        >
                          <span
                            className={`block text-xs font-black uppercase tracking-[0.14em] transition ${
                              child.label === "Need Help Now"
                                ? "text-red-500 group-hover:text-red-400"
                                : item.customShop || item.cares
                                  ? "text-red-600 group-hover:text-red-500"
                                  : "text-[#D4AF37] group-hover:text-[#F1D36A]"
                            }`}
                          >
                            {child.label}
                          </span>

                          <span className="mt-1 block text-xs leading-4 text-white/40">
                            {child.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href ?? "/"}
                  onClick={closeNavigation}
                  className={
                    item.highlight
                      ? "mx-2 animate-[pulse_1.8s_ease-in-out_infinite] border border-red-600 px-3 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-[#D4AF37] shadow-[0_0_10px_rgba(220,38,38,0.65)] transition hover:bg-red-700/30 xl:text-[10px] 2xl:mx-3 2xl:px-4 2xl:text-xs"
                      : `px-2 text-[9px] font-black uppercase tracking-[0.08em] transition xl:px-3 xl:text-[10px] 2xl:px-4 2xl:text-xs ${color(item)}`
                  }
                >
                  {item.highlight ? (
                    <span className="flex w-full flex-col items-center justify-center text-center leading-tight">
                      <span>Join the</span>
                      <span>Nation</span>
                    </span>
                  ) : (
                    item.label
                  )}
                </Link>
              )
            )}
          </nav>

          <div className="flex w-full items-center justify-between lg:hidden">
            <Link
              href="/"
              onClick={closeNavigation}
              className="text-sm font-black uppercase tracking-[0.2em] text-[#D4AF37]"
            >
              FAFO Nation
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((value) => !value);
                setOpenMobileMenu(null);
              }}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle main navigation"
              className="flex min-h-10 min-w-10 items-center justify-center border border-red-600/60 text-xl text-[#D4AF37]"
            >
              <span aria-hidden="true">
                {mobileMenuOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-white/10 bg-black lg:hidden"
          >
            <div className="mx-auto w-full max-w-7xl px-5 py-4 sm:px-10">
              {NAV_ITEMS.map((item) =>
                item.children ? (
                  <div
                    key={item.label}
                    className="border-b border-white/10"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileMenu((value) =>
                          value === item.label ? null : item.label
                        )
                      }
                      aria-expanded={openMobileMenu === item.label}
                      className={`flex w-full items-center justify-between py-4 text-left text-xs font-black uppercase tracking-[0.14em] ${color(item)}`}
                    >
                      <span className="flex items-center gap-2">
                        {label(item)}
                      </span>

                      <span
                        aria-hidden="true"
                        className={`text-[9px] transition-transform ${
                          openMobileMenu === item.label ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>                    {openMobileMenu === item.label && (
                      <div className="pb-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={closeNavigation}
                            className="group block border-l border-white/15 py-3 pl-5"
                          >
                            <span
                              className={`block text-xs font-black uppercase tracking-[0.12em] ${
                                child.label === "Need Help Now"
                                  ? "text-red-500"
                                  : item.customShop || item.cares
                                    ? "text-red-600"
                                    : "text-[#D4AF37]"
                              }`}
                            >
                              {child.label}
                            </span>

                            <span className="mt-1 block text-xs leading-5 text-white/40">
                              {child.description}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href ?? "/"}
                    onClick={closeNavigation}
                    className={
                      item.highlight
                        ? "my-4 flex w-full items-center justify-center border border-red-600 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#D4AF37] shadow-[0_0_10px_rgba(220,38,38,0.65)]"
                        : `block border-b border-white/10 py-4 text-xs font-black uppercase tracking-[0.14em] ${color(item)}`
                    }
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </nav>
        )}
      </header>


      <style jsx global>{`
        .fafo-nav-red {
          color: #dc2626 !important;
          -webkit-text-fill-color: #dc2626 !important;
        }

        .fafo-nav-custom {
          color: #dc2626 !important;
          -webkit-text-fill-color: #dc2626 !important;
        }

        .fafo-nav-cares {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `}</style>
    </>
  );
}