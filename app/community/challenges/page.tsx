import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";

export const metadata: Metadata = { title: "Community Challenges", description: "Current status of planned FAFO Nation community challenges." };
export default function CommunityChallengesPage() { return <PublicStatusPage eyebrow="Community Participation" title="Community" accentTitle="Challenges" introduction="Community Challenges are intended to create future opportunities for FAFO Nation members to participate around shared goals and positive action." statusLabel="Challenges — Coming Later" statusText="No active challenge, rules, dates, participation tracking, rewards, or submission process is currently available." backHref="/community" backLabel="Return to Community" />; }
