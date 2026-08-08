import Link from "next/link";

import { MEMBER_ACCESS_READINESS } from "@/lib/auth/config.server";

export default function MemberAccessPanel() {
  if (!MEMBER_ACCESS_READINESS.enabled) {
    return (
      <aside className="border border-[#D4AF37]/30 bg-[#D4AF37]/[0.04] p-6 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F1D36A]">
          Member access is not open in this environment
        </p>
        <p className="mt-4 text-sm leading-7 text-white/65 sm:text-base">
          The verified-email authentication and private member foundation is implemented, but this environment has no approved WorkOS and isolated database configuration. No account will be implied or created here.
        </p>
      </aside>
    );
  }

  return (
    <aside className="border border-red-500/45 bg-red-950/10 p-6 sm:p-7">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F1D36A]">Secure member access</p>
      <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
        Continue to the hosted WorkOS AuthKit experience. FAFO Nation creates a private member association only after WorkOS reports a verified email.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <form action="/auth/sign-up" method="post" className="w-full">
          <label className="flex items-start gap-3 text-sm leading-6 text-white/75">
            <input type="checkbox" name="adultEligibility" value="confirmed" required className="mt-1 h-5 w-5 accent-red-500" />
            <span>I confirm that I am at least 18 years old.</span>
          </label>
          <button type="submit" className="mt-4 inline-flex min-h-12 items-center border border-red-500 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#F1D36A] transition hover:bg-red-700/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400">
            Continue to secure sign-up
          </button>
        </form>
        <Link href="/auth/sign-in" className="inline-flex min-h-12 items-center border border-white/25 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          Sign in
        </Link>
      </div>
    </aside>
  );
}
