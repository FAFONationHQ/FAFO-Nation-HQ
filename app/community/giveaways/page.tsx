import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";

export const metadata: Metadata = { title: "Giveaways", description: "Current status of future FAFO Nation giveaway information." };
export default function GiveawaysPage() { return <PublicStatusPage eyebrow="Community" title="FAFO Nation" accentTitle="Giveaways" introduction="This area is intended to publish approved FAFO Nation giveaway information when legitimate events and complete participation details are available." statusLabel="No Active Giveaways" statusText="No prizes, dates, rules, eligibility requirements, winners, sponsors, or entry process are currently published." backHref="/community" backLabel="Return to Community" />; }
