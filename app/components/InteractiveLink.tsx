import type { ReactNode } from "react";

type InteractiveLinkProps = Readonly<{
  href: string;
  children: ReactNode;
  variant?: "velvet" | "fafo";
  tone?: "primary" | "secondary";
  external?: boolean;
  leadingMark?: ReactNode;
}>;

const accents = {
  velvet: "border-[#b55a83]/80 text-[#f7c4d8] shadow-[0_0_0_1px_rgba(214,130,168,0.14),inset_0_0_16px_rgba(181,90,131,0.10)] hover:border-[#f7c4d8] hover:shadow-[0_6px_22px_rgba(183,66,145,0.28),inset_0_0_18px_rgba(183,66,145,0.16)] focus-visible:outline-[#f7c4d8]",
  fafo: "border-red-600/80 text-[#f8d7d7] shadow-[0_0_0_1px_rgba(220,38,38,0.14),inset_0_0_16px_rgba(220,38,38,0.10)] hover:border-red-400 hover:shadow-[0_6px_22px_rgba(220,38,38,0.28),inset_0_0_18px_rgba(220,38,38,0.16)] focus-visible:outline-red-400",
};

export function InteractiveLink({ href, children, variant = "fafo", tone = "primary", external = false, leadingMark }: InteractiveLinkProps) {
  const compact = tone === "secondary";
  return <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`group relative inline-flex min-h-11 items-center justify-center overflow-hidden border bg-[#111214] font-sans text-[10px] font-black uppercase leading-none tracking-[0.16em] transition duration-200 [clip-path:polygon(0.6rem_0,100%_0,100%_calc(100%-0.6rem),calc(100%-0.6rem)_100%,0_100%,0_0.6rem)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${compact ? "px-4 sm:px-5" : "px-5 sm:px-6"} ${accents[variant]}`}><span aria-hidden="true" className="pointer-events-none absolute inset-[3px] border border-white/10 [clip-path:polygon(0.45rem_0,100%_0,100%_calc(100%-0.45rem),calc(100%-0.45rem)_100%,0_100%,0_0.45rem)]" />{leadingMark ? <span aria-hidden="true" className="relative mr-2 flex h-5 w-5 items-center justify-center border-r border-current/30 pr-2">{leadingMark}</span> : null}<span className="relative">{children}</span>{external ? <span aria-hidden="true" className="relative ml-2 text-sm transition-transform duration-200 group-hover:translate-x-0.5">↗</span> : <span aria-hidden="true" className="relative ml-2 text-sm transition-transform duration-200 group-hover:translate-x-0.5">→</span>}</a>;
}
