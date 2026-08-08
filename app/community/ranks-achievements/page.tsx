import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";

export const metadata: Metadata = { title: "Ranks & Achievements", description: "Current status of planned FAFO Nation ranks and achievements." };
export default function RanksAchievementsPage() { return <PublicStatusPage eyebrow="Community Recognition" title="Ranks &" accentTitle="Achievements" introduction="Ranks and achievements are intended to recognize participation and contribution within FAFO Nation without replacing the shared standard of showing up." statusLabel="Planned Member Capability" statusText="No rank system, achievement badges, criteria, awards, or member records are currently published. This area requires future account, review, and consent systems." backHref="/community" backLabel="Return to Community" />; }
