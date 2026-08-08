import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Challenge Coins", description: "Current status of future FAFO Nation challenge-coin listings." };
export default function ChallengeCoinsPage() { return <PublicStatusPage eyebrow="FAFO Gear" title="Challenge" accentTitle="Coins" introduction="This category is intended to present approved FAFO Nation challenge coins and special releases." statusLabel="Listings — Coming Later" statusText="No coin design, edition, material, dimensions, quantity, price, availability, or collector claim is currently published." backHref="/store" backLabel="Return to Store" />; }
