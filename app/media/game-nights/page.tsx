import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Community Game Nights", description: "Current status of planned FAFO Nation community game nights." };
export default function GameNightsPage() { return <PublicStatusPage eyebrow="Media & Community" title="Community" accentTitle="Game Nights" introduction="Community Game Nights are intended to create future shared gaming opportunities for the FAFO Nation community." statusLabel="No Game Night Scheduled" statusText="No game, platform, date, host, participation rules, registration, or attendance information is currently published." backHref="/media" backLabel="Return to Media" />; }
